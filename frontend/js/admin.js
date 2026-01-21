const BASE_URL = 'https://website-production-f869.up.railway.app';
const ADMIN_PASS = "turjo0424";

window.onload = () => {
    initTheme();
    initSidebarToggle();
    const auth = sessionStorage.getItem('adminAuth');
    if (auth !== ADMIN_PASS) {
        window.location.href = 'admin-login.html';
    } else {
        loadPage('dashboard');
    }
};

async function loadPage(page) {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    mainContent.innerHTML = `<div class="p-20 text-center"><i class="fas fa-spinner fa-spin text-4xl text-blue-500"></i></div>`;

    try {
        if (page === 'dashboard') {
            mainContent.innerHTML = `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                    <div class="glass-card p-8 border-l-4 border-blue-500">
                        <p class="text-[10px] font-black text-slate-400 uppercase">Today Revenue</p>
                        <h4 id="today-income" class="text-4xl font-black mt-2">৳0</h4>
                    </div>
                    <div class="glass-card p-8 border-l-4 border-green-500">
                        <p class="text-[10px] font-black text-slate-400 uppercase">Today Orders</p>
                        <h4 id="month-orders" class="text-4xl font-black mt-2">0 Orders</h4>
                    </div>
                </div>
                <div class="glass-card p-6 h-[300px]"><canvas id="revenueChart"></canvas></div>`;
            document.getElementById('page-title').innerText = "Dashboard";
            refreshDashboardData();
        } else {
            const res = await fetch(`admin-${page}.html`);
            const html = await res.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            mainContent.innerHTML = doc.getElementById('main-content')?.innerHTML || html;
            document.getElementById('page-title').innerText = page.charAt(0).toUpperCase() + page.slice(1);
            
            // সংশ্লিষ্ট JS লোড করা
            const script = document.createElement('script');
            script.src = `js/admin-${page}.js`;
            document.body.appendChild(script);
        }
    } catch (err) {
        mainContent.innerHTML = `<p class="text-rose-500">Error loading ${page}</p>`;
    }
}

// ড্যাশবোর্ড ডাটা ফাংশন
async function refreshDashboardData() {
    try {
        const res = await fetch(`${BASE_URL}/orders`);
        const orders = await res.json();
        document.getElementById('today-income').innerText = `৳${orders.length * 50}`; // ডামি ক্যালকুলেশন
        document.getElementById('month-orders').innerText = `${orders.length} Orders`;
    } catch (e) { console.log(e); }
}

function handleAdminLogout() {
    sessionStorage.removeItem('adminAuth');
    window.location.href = 'admin-login.html';
}

function initTheme() {
    const btn = document.getElementById('theme-toggle');
    btn.onclick = () => {
        document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    };
    if(localStorage.getItem('theme') === 'dark') document.documentElement.classList.add('dark');
}

function initSidebarToggle() {
    const btn = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('main-sidebar');
    btn.onclick = () => sidebar.classList.toggle('minimized');
}
