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
        // টেস্ট করার জন্য নিচের লাইনটি কমেন্ট আউট করে রাখা হয়েছে
        // window.location.href = 'admin-login.html'; 
        loadPage('dashboard');
    } else {
        loadPage('dashboard');
    }
};

// ১. ডাইনামিক নেভিগেশন লজিক
function initNavigation() {
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.onclick = () => {
            const span = item.querySelector('span');
            if(!span) return;
            const text = span.innerText.toLowerCase();
            
            // অ্যাক্টিভ ক্লাস ম্যানেজমেন্ট
            document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            if (text.includes('dashboard')) loadPage('dashboard');
            else if (text.includes('products')) loadPage('products');
            else if (text.includes('orders')) loadPage('orders');
            else if (text.includes('slider')) loadPage('slider');
            else if (text.includes('analytics')) loadPage('analytics');
        };
    });
}

// ২. পেজ কন্টেন্ট লোডার (SPA) - আপনার স্ক্রিনশটের ডিজাইন অনুযায়ী আপডেট করা
async function loadPage(page) {
    const mainContent = document.querySelector('main > div.p-6');
    const titleEl = document.getElementById('page-title');
    
    if (!mainContent) return;

    if (page === 'dashboard') {
        if (titleEl) titleEl.innerText = "Dashboard Overview";
        // ড্যাশবোর্ডের অরিজিনাল ডাটা রেন্ডার হবে
        refreshData(); 
    } else if (page === 'products') {
        if (titleEl) titleEl.innerText = "Product Inventory";
        mainContent.innerHTML = `
            <div class="glass-card p-10 text-center animate-fade-in">
                <i class="fas fa-box-open text-4xl text-blue-500 mb-4"></i>
                <h2 class="text-xl font-bold">Product Management</h2>
                <p class="text-slate-400 mt-2">Loading inventory from server...</p>
            </div>`;
        // এখানে আপনার অরিজিনাল fetchInventory() কল করুন
    } else if (page === 'orders') {
        if (titleEl) titleEl.innerText = "Order Management";
        mainContent.innerHTML = `
            <div class="glass-card p-10 text-center animate-fade-in">
                <i class="fas fa-shopping-cart text-4xl text-orange-500 mb-4"></i>
                <h2 class="text-xl font-bold">Customer Orders</h2>
                <p class="text-slate-400 mt-2">Fetching orders data...</p>
            </div>`;
    } else if (page === 'slider') {
        if (titleEl) titleEl.innerText = "Slider Management";
        mainContent.innerHTML = `
            <div class="glass-card p-10 text-center animate-fade-in">
                <i class="fas fa-images text-4xl text-purple-500 mb-4"></i>
                <h2 class="text-xl font-bold">Homepage Banners</h2>
                <p class="text-slate-400 mt-2">Loading banner settings...</p>
            </div>`;
    }
}

// ৩. ডাটা রিফ্রেশ লজিক
async function refreshData() {
    try {
        const [pRes, oRes] = await Promise.all([
            fetch(`${BASE_URL}/products`).catch(() => null),
            fetch(`${BASE_URL}/orders`).catch(() => null)
        ]);
        
        if (!pRes || !oRes) throw new Error("Server Unreachable");

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

// ৪. স্ট্যাটাস এবং চার্ট আপডেট ফাংশনসমূহ (আপনার দেওয়া লজিক অনুযায়ী)
function updateStats(orders) {
    const incomeEl = document.getElementById('today-income');
    const orderCountEl = document.getElementById('month-orders');
    const todayRev = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
    
    if (incomeEl) incomeEl.innerText = `৳${todayRev.toLocaleString()}`;
    if (orderCountEl) orderCountEl.innerText = `${orders.length} Orders`;
}

function updateInsights(orders, products) {
    const cards = document.querySelectorAll('.glass-card h4.text-2xl');
    if (cards.length >= 4) {
        cards[0].innerText = orders.length;
        cards[1].innerText = `৳${orders.reduce((s, o) => s + (o.totalAmount || 0), 0).toLocaleString()}`;
        cards[3].innerText = products.filter(p => p.stockQuantity <= 5).length;
    }
}

function renderCharts(orders) {
    const rCtx = document.getElementById('revenueChart')?.getContext('2d');
    const sCtx = document.getElementById('orderStatusChart')?.getContext('2d');

    if (rCtx) {
        if (revenueChartInstance) revenueChartInstance.destroy();
        revenueChartInstance = new Chart(rCtx, {
            type: 'line',
            data: {
                labels: orders.slice(-7).map(o => new Date(o.orderedAt).getDate()),
                datasets: [{ label: 'Revenue', data: orders.slice(-7).map(o => o.totalAmount), borderColor: '#2563eb', tension: 0.4 }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }
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
            toggleIcon.className = isMinimized ? 'fas fa-chevron-right text-slate-400 text-xs' : 'fas fa-chevron-left text-slate-400 text-xs';
        }
        localStorage.setItem('sidebar-minimized', isMinimized);
    };
}

function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.onclick = () => {
            document.documentElement.classList.toggle('dark');
            const isDark = document.documentElement.classList.contains('dark');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        };
    }
}

function handleAdminLogout() {
    if(confirm("Are you sure?")) {
        sessionStorage.removeItem('adminAuth'); 
        window.location.href = 'admin-login.html'; 
    }
}
