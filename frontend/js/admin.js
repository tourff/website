const BASE_URL = 'https://website-production-f869.up.railway.app';
const ADMIN_PASS = "turjo0424";
let revenueChartInstance = null;
let statusChartInstance = null; 

window.onload = () => {
    const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
    const dateEl = document.getElementById('current-date');
    if (dateEl) dateEl.innerText = new Date().toLocaleDateString('en-US', options);

    const auth = sessionStorage.getItem('adminAuth'); 
    
    if (auth !== ADMIN_PASS) {
        window.location.href = 'admin-login.html'; 
    } else {
        sessionStorage.removeItem('adminAuth'); 
        initDashboard();
        initTheme(); 
        initNavigation(); 
        initSidebarToggle();
    }
};

function initNavigation() {
    const goToPage = (page) => {
        sessionStorage.setItem('adminAuth', ADMIN_PASS);
        window.location.href = page;
    };

    document.querySelectorAll('.sidebar-item, .action-card-lite').forEach(btn => {
        btn.onclick = () => {
            const text = btn.innerText.toLowerCase();
            if (text.includes('dashboard')) goToPage('admin.html');
            else if (text.includes('products')) goToPage('admin-products.html');
            else if (text.includes('orders')) goToPage('admin-orders.html');
            else if (text.includes('intelligence')) goToPage('admin-intelligence.html');
            else if (text.includes('slider')) goToPage('admin-slider.html');
            else if (text.includes('fraud')) goToPage('admin-fraud.html');
        };
    });
}

function initSidebarToggle() {
    const sidebar = document.getElementById('main-sidebar');
    const toggleBtn = document.getElementById('sidebar-toggle');
    const toggleIcon = document.getElementById('toggle-icon');

    if (!sidebar || !toggleBtn) return;

    if (localStorage.getItem('sidebar-minimized') === 'true') {
        sidebar.classList.add('minimized');
        if (toggleIcon) toggleIcon.classList.replace('fa-chevron-left', 'fa-chevron-right');
    }

    toggleBtn.onclick = () => {
        sidebar.classList.toggle('minimized');
        const isMinimized = sidebar.classList.contains('minimized');
        if (toggleIcon) {
            if (isMinimized) toggleIcon.classList.replace('fa-chevron-left', 'fa-chevron-right');
            else toggleIcon.classList.replace('fa-chevron-right', 'fa-chevron-left');
        }
        localStorage.setItem('sidebar-minimized', isMinimized);
    };
}

async function initDashboard() {
    refreshData();
    setInterval(refreshData, 30000); 
}

async function refreshData() {
    try {
        const [pRes, oRes] = await Promise.all([
            fetch(`${BASE_URL}/products`),
            fetch(`${BASE_URL}/orders`)
        ]);
        const products = await pRes.json();
        const orders = await oRes.json();
        
        updateStats(orders);
        updateInsights(orders, products); // নতুন ইনসাইটস কার্ড আপডেট
        renderCharts(orders); 
        updateOperations(orders); 
        renderTopProducts(orders, products); // সেরা প্রোডাক্ট তালিকা
        
    } catch (err) {
        console.error("Dashboard Sync Failed:", err);
    }
}

// ইনসাইটস কার্ডস (30D Stats) আপডেট লজিক
function updateInsights(orders, products) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentOrders = orders.filter(o => new Date(o.orderedAt) >= thirtyDaysAgo);
    const totalRev = recentOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);
    const avgValue = recentOrders.length > 0 ? (totalRev / recentOrders.length) : 0;
    const stockAlerts = products.filter(p => p.stockQuantity <= 5).length;

    const cards = document.querySelectorAll('.glass-card h4.text-2xl');
    if (cards.length >= 4) {
        cards[0].innerText = recentOrders.length; // Total Orders (30D)
        cards[1].innerText = `৳${totalRev.toLocaleString()}`; // Revenue (30D)
        cards[2].innerText = `৳${Math.round(avgValue).toLocaleString()}`; // Avg Order Value
        cards[3].innerText = stockAlerts; // Stock Alerts
        
        // অ্যালার্ট কালার পরিবর্তন
        if (stockAlerts > 0) cards[3].classList.add('text-rose-500');
        else cards[3].classList.remove('text-rose-500');
    }
}

function updateStats(orders) {
    const startOfToday = new Date();
    startOfToday.setHours(0,0,0,0);
    const todayOrders = orders.filter(o => new Date(o.orderedAt) >= startOfToday);
    const todayRev = todayOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);
    
    const incomeEl = document.getElementById('today-income');
    const orderCountEl = document.getElementById('month-orders');
    
    if (incomeEl) incomeEl.innerText = `৳${todayRev.toLocaleString()}`;
    if (orderCountEl) orderCountEl.innerText = `${orders.length} Orders`;
}

// Top Products তালিকা রেন্ডার করা
function renderTopProducts(orders, products) {
    const container = document.querySelector('section.glass-card div.flex-col');
    if (!container) return;

    // প্রোডাক্ট অনুযায়ী বিক্রয় গণনা
    const salesMap = {};
    orders.forEach(order => {
        order.items.forEach(item => {
            salesMap[item.productId] = (salesMap[item.productId] || 0) + item.quantity;
        });
    });

    const topItems = Object.entries(salesMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4);

    if (topItems.length === 0) {
        container.innerHTML = '<p class="text-[10px] font-bold text-slate-400">No sales data yet</p>';
        return;
    }

    let html = '<div class="w-full space-y-3">';
    topItems.forEach(([id, qty]) => {
        const product = products.find(p => p._id === id) || { name: 'Unknown Product' };
        html += `
            <div class="flex justify-between items-center text-[11px] font-bold border-b border-slate-50 dark:border-slate-800 pb-2">
                <span class="truncate pr-4">${product.name}</span>
                <span class="text-blue-500">${qty} Sold</span>
            </div>`;
    });
    html += '</div>';
    container.innerHTML = html;
    container.classList.remove('opacity-30');
}

function renderCharts(orders) {
    renderRevenueChart(orders);
    renderStatusChart(orders);
}

function renderRevenueChart(orders) {
    const chartCanvas = document.getElementById('revenueChart');
    if (!chartCanvas) return;
    const ctx = chartCanvas.getContext('2d');
    if (revenueChartInstance) revenueChartInstance.destroy();

    const last7Orders = orders.slice(-7); 
    const isDark = document.documentElement.classList.contains('dark');

    revenueChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: last7Orders.map(o => new Date(o.orderedAt).toLocaleDateString('en-US', {day: 'numeric', month: 'short'})),
            datasets: [{ 
                label: 'Revenue',
                data: last7Orders.map(o => o.totalAmount), 
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                tension: 0.4, 
                fill: true,
                pointRadius: 4,
                pointBackgroundColor: '#2563eb'
            }]
        },
        options: { 
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' } },
                x: { grid: { display: false } }
            }
        }
    });
}

function renderStatusChart(orders) {
    const canvas = document.getElementById('orderStatusChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (statusChartInstance) statusChartInstance.destroy();

    const pending = orders.filter(o => o.status === 'pending').length;
    const completed = orders.filter(o => o.status === 'completed').length;
    const rejected = orders.filter(o => o.status === 'rejected').length;

    document.getElementById('total-orders-count').innerText = orders.length;

    statusChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Pending', 'Completed', 'Rejected'],
            datasets: [{
                data: [pending, completed, rejected],
                backgroundColor: ['#f59e0b', '#10b981', '#f43f5e'],
                hoverOffset: 4,
                borderWidth: 0,
                cutout: '80%'
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } }
        }
    });
}

function updateOperations(orders) {
    const pendingCount = orders.filter(o => o.status === 'pending').length;
    const opMsg = document.querySelector('.operation-item p');
    if (opMsg) opMsg.innerText = `Process ${pendingCount} pending orders`;
}

function handleAdminLogout() {
    if(confirm("Are you sure?")) {
        sessionStorage.removeItem('adminAuth'); 
        window.location.href = 'admin-login.html'; 
    }
}

function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    if (localStorage.getItem('theme') === 'dark') {
        document.documentElement.classList.add('dark');
        if (themeIcon) themeIcon.classList.replace('fa-moon', 'fa-sun');
    }
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark');
            const isDark = document.documentElement.classList.contains('dark');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            if (themeIcon) {
                if(isDark) themeIcon.classList.replace('fa-moon', 'fa-sun');
                else themeIcon.classList.replace('fa-sun', 'fa-moon');
            }
            refreshData(); 
        });
    }
}
