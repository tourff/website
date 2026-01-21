const BASE_URL = 'https://website-production-f869.up.railway.app';
const ADMIN_PASS = "turjo0424";

// চার্ট ইন্সট্যান্স রাখার জন্য ভেরিয়েবল
let revenueChartInstance = null;
let statusChartInstance = null; 

window.onload = () => {
    initTheme();
    initSidebarToggle();
    initNavigation();
    
    // তারিখ প্রদর্শন
    const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
    const dateEl = document.getElementById('current-date');
    if (dateEl) dateEl.innerText = new Date().toLocaleDateString('en-US', options);

    // সিকিউরিটি চেক: সেশন স্টোরেজে সঠিক পাসওয়ার্ড আছে কি না
    const auth = sessionStorage.getItem('adminAuth'); 
    if (auth !== ADMIN_PASS) {
        window.location.href = 'admin-login.html'; 
    } else {
        // শুরুতে ড্যাশবোর্ড লোড করবে
        loadPage('dashboard');
    }
};

// ১. নেভিগেশন লজিক (SPA সিস্টেম)
function initNavigation() {
    // সাইডবার মেনু ক্লিকের জন্য
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.onclick = () => {
            const span = item.querySelector('span');
            if(!span) return;
            const text = span.innerText.toLowerCase();
            
            // অ্যাক্টিভ ক্লাস ম্যানেজমেন্ট
            document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            // টেক্সট অনুযায়ী পেজ রাউটিং
            if (text.includes('dashboard')) loadPage('dashboard');
            else if (text.includes('products')) loadPage('products');
            else if (text.includes('orders')) loadPage('orders');
            else if (text.includes('slider')) loadPage('slider');
            else if (text.includes('intelligence')) loadPage('intelligence');
        };
    });
}

// ২. মেইন পেজ কন্টেন্ট এবং স্ক্রিপ্ট লোডার
async function loadPage(page) {
    const mainContent = document.getElementById('main-content');
    const pageTitle = document.getElementById('page-title');
    if (!mainContent) return;

    // লোডিং এনিমেশন
    mainContent.innerHTML = `<div class="p-20 text-center"><i class="fas fa-spinner fa-spin text-4xl text-blue-500"></i></div>`;

    try {
        if (page === 'dashboard') {
            // ড্যাশবোর্ডের মূল স্ট্রাকচার (আপনার ডিজাইন অনুযায়ী)
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
                <div class="glass-card p-6 h-[320px] mt-8"><canvas id="revenueChart"></canvas></div>`;
            pageTitle.innerText = "Dashboard";
            refreshDashboardData(); // ড্যাশবোর্ড ডাটা ফেচ করবে
        } else {
            // অন্য সব পেজের জন্য HTML ফেচ করা
            const response = await fetch(`admin-${page}.html`);
            const htmlText = await response.text();
            
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlText, 'text/html');
            mainContent.innerHTML = doc.getElementById('main-content')?.innerHTML || htmlText;
            
            pageTitle.innerText = page.charAt(0).toUpperCase() + page.slice(1);
            
            // সংশ্লিষ্ট ডাইনামিক JS ফাইল লোড করা
            loadDynamicScript(page);
        }
    } catch (err) {
        console.error("Page Load Error:", err);
        mainContent.innerHTML = `<div class="p-10 text-rose-500">Error: Could not load admin-${page}.html</div>`;
    }
}

// ৩. ডাইনামিক স্ক্রিপ্ট ইনজেক্টর
function loadDynamicScript(page) {
    const scriptId = `script-admin-${page}`;
    const oldScript = document.getElementById(scriptId);
    if (oldScript) oldScript.remove();

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `js/admin-${page}.js`;
    document.body.appendChild(script);
}

// ৪. ড্যাশবোর্ড ডাটা রিফ্রেশ ফাংশন
async function refreshDashboardData() {
    try {
        const res = await fetch(`${BASE_URL}/orders`);
        const orders = await res.json();
        const incomeEl = document.getElementById('today-income');
        const ordersEl = document.getElementById('month-orders');
        
        if (incomeEl) incomeEl.innerText = `৳${orders.length * 50}`; 
        if (ordersEl) ordersEl.innerText = `${orders.length} Orders`;
        
        // ড্যাশবোর্ড চার্ট রেন্ডার
        renderDashboardChart(orders);
    } catch (err) {
        console.error("Sync Error:", err);
    }
}

// ৫. ড্যাশবোর্ড চার্ট রেন্ডার
function renderDashboardChart(orders) {
    const ctx = document.getElementById('revenueChart')?.getContext('2d');
    if (!ctx) return;
    if (revenueChartInstance) revenueChartInstance.destroy();

    revenueChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: orders.slice(-7).map(o => new Date(o.orderedAt).toLocaleDateString()),
            datasets: [{ label: 'Revenue', data: orders.slice(-7).map(o => o.totalAmount), borderColor: '#2563eb', tension: 0.4 }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

// সিস্টেম ফাংশনসমূহ
function initSidebarToggle() {
    const sidebar = document.getElementById('main-sidebar');
    const toggleBtn = document.getElementById('sidebar-toggle');
    if (toggleBtn) toggleBtn.onclick = () => sidebar.classList.toggle('minimized');
}

function initTheme() {
    const toggle = document.getElementById('theme-toggle');
    if (localStorage.getItem('theme') === 'dark') document.documentElement.classList.add('dark');
    if (toggle) toggle.onclick = () => {
        document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    };
}

function handleAdminLogout() {
    if(confirm("Are you sure?")) {
        sessionStorage.removeItem('adminAuth'); 
        window.location.href = 'admin-login.html'; 
    }
}
