const BASE_URL = 'https://website-production-f869.up.railway.app';
const ADMIN_PASS = "turjo0424";
let revenueChartInstance = null;
let statusChartInstance = null; 

window.onload = () => {
    initTheme();
    initSidebarToggle();
    initNavigation();
    
    const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
    const dateEl = document.getElementById('current-date');
    if (dateEl) dateEl.innerText = new Date().toLocaleDateString('en-US', options);

    const auth = sessionStorage.getItem('adminAuth'); 
    
    if (auth !== ADMIN_PASS) {
        window.location.href = 'admin-login.html'; 
    } else {
        sessionStorage.removeItem('adminAuth'); 
        // ডিফল্টভাবে ড্যাশবোর্ড লোড হবে
        loadPage('dashboard');
    }
};

// ১. ডাইনামিক নেভিগেশন লজিক
function initNavigation() {
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.onclick = () => {
            const text = item.innerText.toLowerCase();
            
            // অ্যাক্টিভ ক্লাস ম্যানেজমেন্ট
            document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            if (text.includes('dashboard')) loadPage('dashboard');
            else if (text.includes('inventory') || text.includes('products')) loadPage('products');
            else if (text.includes('orders')) loadPage('orders');
            else if (text.includes('intelligence')) loadPage('intelligence');
            else if (text.includes('pulse') || text.includes('analytics')) loadPage('analytics');
        };
    });
}

// ২. পেজ কন্টেন্ট লোডার (SPA)
async function loadPage(page) {
    const mainContent = document.getElementById('main-content');
    const title = document.getElementById('page-title');
    
    // পেজ অনুযায়ী কন্টেন্ট পরিবর্তন
    if (page === 'dashboard') {
        title.innerText = "Dashboard Overview";
        mainContent.innerHTML = `
            <div class="animate-fade-in space-y-8 text-left">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="glass-card p-8 border-l-4 border-blue-500">
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Today Revenue</p>
                        <h4 id="today-income" class="text-4xl font-black mt-2 text-slate-800 dark:text-white">৳0</h4>
                    </div>
                    <div class="glass-card p-8 border-l-4 border-green-500">
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Today Orders</p>
                        <h4 id="month-orders" class="text-4xl font-black mt-2 text-slate-800 dark:text-white">0 Orders</h4>
                    </div>
                </div>
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div class="lg:col-span-2"><section class="glass-card p-6"><div class="h-[280px]"><canvas id="revenueChart"></canvas></div></section></div>
                    <section class="glass-card p-6 text-center">
                        <div class="relative flex justify-center items-center h-[200px]"><canvas id="orderStatusChart"></canvas><div class="absolute text-center"><p id="total-orders-count" class="text-3xl font-black text-slate-800 dark:text-white">0</p></div></div>
                    </section>
                </div>
            </div>`;
        initDashboard(); // ড্যাশবোর্ড ডাটা ফেচ শুরু
    } else if (page === 'products') {
        title.innerText = "Product Inventory";
        mainContent.innerHTML = `<div class="p-8 text-center text-slate-400 font-bold uppercase tracking-widest">Loading Products Interface...</div>`;
        // এখানে আপনার প্রোডাক্ট পেজের ইন্টারফেস ফাংশন কল হবে
    }
}

// ৩. ডাটা রিফ্রেশ লজিক
async function initDashboard() {
    refreshData();
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
        updateInsights(orders, products);
        renderCharts(orders); 
        updateOperations(orders); 
        renderTopProducts(orders, products);
        
    } catch (err) {
        console.error("Dashboard Sync Failed:", err);
    }
}

// ৪. স্ট্যাটাস এবং চার্ট আপডেট (আপনার আগের লজিকগুলো অক্ষুণ্ণ আছে)
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

function updateInsights(orders, products) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentOrders = orders.filter(o => new Date(o.orderedAt) >= thirtyDaysAgo);
    const totalRev = recentOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);
    const avgValue = recentOrders.length > 0 ? (totalRev / recentOrders.length) : 0;
    const stockAlerts = products.filter(p => p.stockQuantity <= 5).length;

    // যদি ড্যাশবোর্ড ভিউতে থাকে তবেই আপডেট হবে
    const cards = document.querySelectorAll('.glass-card h4.text-2xl');
    if (cards.length >= 4) {
        cards[0].innerText = recentOrders.length;
        cards[1].innerText = `৳${totalRev.toLocaleString()}`;
        cards[2].innerText = `৳${Math.round(avgValue).toLocaleString()}`;
        cards[3].innerText = stockAlerts;
    }
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
                tension: 0.4, fill: true, pointRadius: 4, pointBackgroundColor: '#2563eb'
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
                hoverOffset: 4, borderWidth: 0, cutout: '80%'
            }]
        },
        options: { responsive: true, plugins: { legend: { display: false } } }
    });
}

function renderTopProducts(orders, products) {
    const container = document.querySelector('section.glass-card div.flex-col');
    if (!container) return;
    const salesMap = {};
    orders.forEach(order => {
        order.items.forEach(item => {
            salesMap[item.productId] = (salesMap[item.productId] || 0) + item.quantity;
        });
    });
    const topItems = Object.entries(salesMap).sort((a, b) => b[1] - a[1]).slice(0, 4);
    if (topItems.length === 0) return;
    let html = '<div class="w-full space-y-3">';
    topItems.forEach(([id, qty]) => {
        const product = products.find(p => p._id === id) || { name: 'Unknown Product' };
        html += `<div class="flex justify-between items-center text-[11px] font-bold border-b border-slate-50 dark:border-slate-800 pb-2">
                <span class="truncate pr-4">${product.name}</span><span class="text-blue-500">${qty} Sold</span></div>`;
    });
    html += '</div>';
    container.innerHTML = html;
}

function updateOperations(orders) {
    const pendingCount = orders.filter(o => o.status === 'pending').length;
    const opMsg = document.querySelector('.operation-item p');
    if (opMsg) opMsg.innerText = `Process ${pendingCount} pending orders`;
}

// ৫. সিস্টেম ফাংশনসমূহ (Theme & Sidebar)
function initSidebarToggle() {
    const sidebar = document.getElementById('main-sidebar');
    const toggleBtn = document.getElementById('sidebar-toggle');
    const toggleIcon = document.getElementById('toggle-icon');

    if (!sidebar || !toggleBtn) return;

    toggleBtn.onclick = () => {
        sidebar.classList.toggle('minimized');
        const isMinimized = sidebar.classList.contains('minimized');
        if (toggleIcon) {
            toggleIcon.className = isMinimized ? 'fas fa-indent text-slate-400 text-xs' : 'fas fa-bars text-slate-400 text-xs';
        }
        localStorage.setItem('sidebar-minimized', isMinimized);
    };

    if (localStorage.getItem('sidebar-minimized') === 'true') {
        sidebar.classList.add('minimized');
        if (toggleIcon) toggleIcon.className = 'fas fa-indent text-slate-400 text-xs';
    }
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
        themeToggle.onclick = () => {
            document.documentElement.classList.toggle('dark');
            const isDark = document.documentElement.classList.contains('dark');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            if (themeIcon) {
                if(isDark) themeIcon.classList.replace('fa-moon', 'fa-sun');
                else themeIcon.classList.replace('fa-sun', 'fa-moon');
            }
            refreshData(); 
        };
    }
}
