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

    // সিকিউরিটি চেক
    const auth = sessionStorage.getItem('adminAuth'); 
    if (auth !== ADMIN_PASS) {
        window.location.href = 'admin-login.html'; 
    } else {
        // ড্যাশবোর্ড লোড করার সময় চেক করা হচ্ছে এটি কোন ফাইল থেকে কল হচ্ছে
        const currentPath = window.location.pathname;
        if (currentPath.includes('admin.html') || currentPath.endsWith('/')) {
            loadPage('dashboard');
        }
    }
};

// ১. নেভিগেশন কন্ট্রোল (আপনার চাহিদা অনুযায়ী রিডাইরেক্ট লজিক)
function initNavigation() {
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.onclick = () => {
            const span = item.querySelector('span');
            if(!span) return;
            const text = span.innerText.toLowerCase();
            
            // অ্যাক্টিভ ক্লাস ম্যানেজমেন্ট
            document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            // আপনার চাহিদা মতো সরাসরি ফাইল রিডাইরেক্ট লজিক
            if (text.includes('dashboard')) {
                // যদি অলরেডি admin.html এ থাকেন তবে শুধু কন্টেন্ট রিফ্রেশ করবে
                if (window.location.pathname.includes('admin.html')) loadPage('dashboard');
                else window.location.href = 'admin.html';
            } 
            else if (text.includes('products')) window.location.href = 'admin-products.html'; 
            else if (text.includes('orders')) window.location.href = 'admin-orders.html'; 
            else if (text.includes('intelligence')) window.location.href = 'admin-intelligence.html';
            
            // স্লাইডার এবং অ্যানালিটিক্স admin.html এর ভেতরেই লোড হবে
            else if (text.includes('slider')) loadPage('slider');
            else if (text.includes('analytics')) loadPage('analytics');
        };
    });
}

// ২. পেজ কন্টেন্ট লোডার (SPA logic for Dashboard & Slider)
async function loadPage(page) {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    if (page === 'dashboard') {
        // ড্যাশবোর্ডের মূল স্ট্রাকচার লোড করা (যদি প্রয়োজন হয়)
        refreshData(); 
    } else if (page === 'slider') {
        mainContent.innerHTML = `
            <div class="space-y-8 animate-in fade-in duration-500 text-left">
                <div>
                    <h2 class="text-3xl font-black text-slate-800 dark:text-white">Slider Management</h2>
                    <p class="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Update website hero banners</p>
                </div>
                <section class="glass-card p-8">
                    <div class="flex flex-col md:flex-row gap-6 items-end">
                        <div class="flex-1 space-y-2">
                            <label class="text-[10px] font-black uppercase text-slate-400 ml-2">Banner Image URL</label>
                            <input type="text" id="slider-url" placeholder="https://example.com/banner.jpg" class="w-full bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl outline-none border border-transparent focus:border-blue-500 transition text-sm dark:text-white">
                        </div>
                        <button onclick="addSlider()" class="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-blue-700 transition">
                            <i class="fas fa-plus mr-2"></i> Add Banner
                        </button>
                    </div>
                </section>
                <div id="slider-list" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
                    <div class="col-span-full py-20 text-center opacity-20">
                        <i class="fas fa-images text-6xl mb-4 text-slate-400"></i>
                        <p class="font-bold uppercase tracking-widest text-xs">Fetching Banners...</p>
                    </div>
                </div>
            </div>`;
        fetchSliders();
    } else {
        mainContent.innerHTML = `
            <div class="glass-card p-10 text-center animate-pulse">
                <i class="fas fa-spinner fa-spin text-4xl text-blue-500 mb-4"></i>
                <h2 class="text-xl font-bold">Loading ${page}...</h2>
                <p class="text-slate-400 mt-2">Connecting to ${BASE_URL}</p>
            </div>`;
    }
}

// --- স্লাইডার ফাংশনসমূহ (ব্যাকএন্ডের /sliders এন্ডপয়েন্ট ব্যবহার করে) ---
async function fetchSliders() {
    const container = document.getElementById('slider-list');
    if (!container) return;
    try {
        const res = await fetch(`${BASE_URL}/sliders`);
        const sliders = await res.json();
        
        if (sliders.length === 0) {
            container.innerHTML = `<div class="col-span-full py-10 text-center text-slate-400 font-bold uppercase text-[10px]">No active banners</div>`;
            return;
        }

        container.innerHTML = sliders.map(s => `
            <div class="glass-card overflow-hidden group relative transition-all hover:shadow-xl">
                <img src="${s.imageUrl || s.image}" class="w-full h-48 object-cover group-hover:scale-105 transition duration-500">
                <div class="p-4 flex justify-between items-center bg-white dark:bg-[#161021]">
                    <span class="text-[9px] font-black text-slate-400 uppercase">ID: ${s._id.slice(-6)}</span>
                    <button onclick="deleteSlider('${s._id}')" class="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition">
                        <i class="fas fa-trash-alt text-xs"></i>
                    </button>
                </div>
            </div>
        `).join('');
    } catch (err) {
        container.innerHTML = `<p class="col-span-full text-center text-rose-500">Failed to load data</p>`;
    }
}

async function addSlider() {
    const urlInput = document.getElementById('slider-url');
    if (!urlInput.value) return alert("Please enter image URL");

    try {
        const res = await fetch(`${BASE_URL}/admin/add-slider`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageUrl: urlInput.value })
        });
        if (res.ok) {
            urlInput.value = '';
            fetchSliders();
        }
    } catch (err) {
        alert("Action failed!");
    }
}

async function deleteSlider(id) {
    if (!confirm("Delete this banner?")) return;
    try {
        const res = await fetch(`${BASE_URL}/admin/delete-slider/${id}`, { method: 'DELETE' });
        if (res.ok) fetchSliders();
    } catch (err) {
        alert("Delete failed!");
    }
}

// --- ড্যাশবোর্ড ও অ্যানালিটিক্স ফাংশনসমূহ ---
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

function updateStats(orders) {
    const startOfToday = new Date();
    startOfToday.setHours(0,0,0,0);
    const todayOrders = orders.filter(o => new Date(o.orderedAt) >= startOfToday);
    const todayRev = todayOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);
    const incomeEl = document.getElementById('today-income');
    const orderCountEl = document.getElementById('month-orders');
    if (incomeEl) incomeEl.innerText = `৳${todayRev.toLocaleString()}`;
    if (orderCountEl) orderCountEl.innerText = `${todayOrders.length} Orders Today`;
}

function updateInsights(orders, products) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentOrders = orders.filter(o => new Date(o.orderedAt) >= thirtyDaysAgo);
    const totalRev = recentOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);
    const avgValue = recentOrders.length > 0 ? (totalRev / recentOrders.length) : 0;
    const outOfStock = products.filter(p => p.stockQuantity <= 0).length;
    const lowStock = products.filter(p => p.stockQuantity > 0 && p.stockQuantity <= 5).length;
    const totalAlerts = outOfStock + lowStock;
    const cards = document.querySelectorAll('.glass-card h4.text-2xl');
    if (cards.length >= 4) {
        cards[0].innerText = recentOrders.length;
        cards[1].innerText = `৳${totalRev.toLocaleString()}`;
        cards[2].innerText = `৳${Math.round(avgValue).toLocaleString()}`;
        cards[3].innerText = totalAlerts;
        cards[3].className = totalAlerts > 0 ? "text-2xl font-black text-rose-500" : "text-2xl font-black text-emerald-500";
    }
}

function renderCharts(orders) { renderRevenueChart(orders); renderStatusChart(orders); }

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
            datasets: [{ label: 'Revenue', data: last7Orders.map(o => o.totalAmount), borderColor: '#2563eb', tension: 0.4, fill: true, backgroundColor: 'rgba(37, 99, 235, 0.1)' }]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { grid: { color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' } } } }
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
    statusChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: { labels: ['Pending', 'Completed', 'Rejected'], datasets: [{ data: [pending, completed, rejected], backgroundColor: ['#f59e0b', '#10b981', '#f43f5e'], cutout: '80%' }] },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

function renderTopProducts(orders, products) {
    const container = document.getElementById('top-products-list');
    if (!container) return;
    const salesMap = {};
    orders.forEach(order => order.items?.forEach(item => salesMap[item.productId] = (salesMap[item.productId] || 0) + item.quantity));
    const topItems = Object.entries(salesMap).sort((a, b) => b[1] - a[1]).slice(0, 4);
    let html = '<div class="w-full space-y-3 mt-4">';
    topItems.forEach(([id, qty]) => {
        const product = products.find(p => p._id === id) || { name: 'Unknown Product' };
        html += `<div class="flex justify-between items-center text-[11px] font-bold border-b border-slate-50 dark:border-slate-800 pb-2"><span>${product.name}</span><span class="text-blue-500">${qty} Sold</span></div>`;
    });
    container.innerHTML = html + '</div>';
}

function updateOperations(orders) {
    const pendingCount = orders.filter(o => o.status === 'pending').length;
    const opMsgs = document.querySelectorAll('.operation-item p');
    if (opMsgs.length > 0) opMsgs[0].innerText = `Process ${pendingCount} pending orders`;
}

function initSidebarToggle() {
    const sidebar = document.getElementById('main-sidebar');
    const toggleBtn = document.getElementById('sidebar-toggle');
    const toggleIcon = document.getElementById('toggle-icon');
    if (!sidebar || !toggleBtn) return;
    toggleBtn.onclick = () => {
        sidebar.classList.toggle('minimized');
        const isMin = sidebar.classList.contains('minimized');
        if (toggleIcon) toggleIcon.className = isMin ? 'fas fa-chevron-right text-slate-400 text-xs' : 'fas fa-chevron-left text-slate-400 text-xs';
        localStorage.setItem('sidebar-minimized', isMin);
    };
    if (localStorage.getItem('sidebar-minimized') === 'true') { 
        sidebar.classList.add('minimized'); 
        if (toggleIcon) toggleIcon.className = 'fas fa-chevron-right text-slate-400 text-xs'; 
    }
}

function handleAdminLogout() { if(confirm("Logout?")) { sessionStorage.removeItem('adminAuth'); window.location.href = 'admin-login.html'; } }

function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const applyTheme = (isDark) => {
        document.documentElement.classList.toggle('dark', isDark);
        const icon = document.getElementById('theme-icon');
        if (icon) icon.className = isDark ? 'fas fa-sun text-yellow-400' : 'fas fa-moon text-slate-600';
    };
    applyTheme(localStorage.getItem('theme') === 'dark');
    if (themeToggle) {
        themeToggle.onclick = () => {
            const isDark = !document.documentElement.classList.contains('dark');
            applyTheme(isDark);
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            if(revenueChartInstance) refreshData();
        };
    }
}
