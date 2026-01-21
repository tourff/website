const BASE_URL = 'https://website-production-f869.up.railway.app';

const ADMIN_PASS = "turjo0424";

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



    // অথেন্টিকেশন চেক

    const auth = sessionStorage.getItem('adminAuth'); 

    

    if (auth !== ADMIN_PASS) {

        // যদি লগইন করা না থাকে তবে লগইন পেজে পাঠাবে

        // window.location.href = 'admin-login.html'; 

        // টেস্ট করার জন্য নিচের লাইনটি কমেন্ট আউট করে রাখা হয়েছে

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

            else if (text.includes('analytics')) loadPage('analytics');

        };

    });

}



// ২. পেজ কন্টেন্ট লোডার (SPA)

async function loadPage(page) {

    // আপনার HTML-এ <main> এর ভেতর কন্টেন্ট লোড হবে

    const mainContent = document.querySelector('main > div.p-6');

    

    if (!mainContent) return;



    if (page === 'dashboard') {

        // ড্যাশবোর্ড লোড করার সময় আপনার অরিজিনাল HTML স্ট্রাকচার বজায় রাখা হয়েছে

        refreshData(); 

    } else if (page === 'products') {

        mainContent.innerHTML = `

            <div class="glass-card p-10 text-center">

                <i class="fas fa-box-open text-4xl text-blue-500 mb-4"></i>

                <h2 class="text-xl font-bold">Product Management</h2>

                <p class="text-slate-400 mt-2">Loading inventory from server...</p>

            </div>`;

        // এখানে fetchInventory() কল করতে পারেন

    }

}



// ৩. ডাটা রিফ্রেশ লজিক

async function refreshData() {

    try {

        // API থেকে ডাটা ফেচ করা

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

        // এরর হলে ইউজারকে জানানোর জন্য ডামি ডাটা বা মেসেজ দিতে পারেন

    }

}



// ৪. স্ট্যাটাস এবং চার্ট আপডেট

function updateStats(orders) {

    const startOfToday = new Date();

    startOfToday.setHours(0,0,0,0);

    

    const todayOrders = orders.filter(o => new Date(o.orderedAt) >= startOfToday);

    const todayRev = todayOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);

    

    const incomeEl = document.getElementById('today-income');

    const orderCountEl = document.getElementById('month-orders');

    

    if (incomeEl) incomeEl.innerText = `৳${todayRev.toLocaleString()}`;

    if (orderCountEl) orderCountEl.innerText = `${todayOrders.length} Orders`;

}



function updateInsights(orders, products) {

    const thirtyDaysAgo = new Date();

    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    

    const recentOrders = orders.filter(o => new Date(o.orderedAt) >= thirtyDaysAgo);

    const totalRev = recentOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);

    const avgValue = recentOrders.length > 0 ? (totalRev / recentOrders.length) : 0;

    const stockAlerts = products.filter(p => p.stockQuantity <= 5).length;



    // নিচতলার ৪টি কার্ড আপডেট

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

                tension: 0.4, 

                fill: true, 

                pointRadius: 4, 

                pointBackgroundColor: '#2563eb'

            }]

        },

        options: { 

            responsive: true, 

            maintainAspectRatio: false,

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



    // ছোট কাউন্টারগুলো আপডেট

    if (document.getElementById('total-orders-count')) document.getElementById('total-orders-count').innerText = orders.length;

    if (document.getElementById('pending-count')) document.getElementById('pending-count').innerText = pending;

    if (document.getElementById('completed-count')) document.getElementById('completed-count').innerText = completed;

    if (document.getElementById('rejected-count')) document.getElementById('rejected-count').innerText = rejected;



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

            maintainAspectRatio: false,

            plugins: { legend: { display: false } } 

        }

    });

}



function renderTopProducts(orders, products) {

    const container = document.querySelector('section.glass-card div.animate-spin')?.parentElement;

    if (!container) return;

    

    const salesMap = {};

    orders.forEach(order => {

        order.items?.forEach(item => {

            salesMap[item.productId] = (salesMap[item.productId] || 0) + item.quantity;

        });

    });

    

    const topItems = Object.entries(salesMap).sort((a, b) => b[1] - a[1]).slice(0, 4);

    

    if (topItems.length === 0) {

        container.innerHTML = '<p class="text-xs text-slate-400">No sales data yet.</p>';

        return;

    }



    let html = '<div class="w-full space-y-3 mt-4">';

    topItems.forEach(([id, qty]) => {

        const product = products.find(p => p._id === id) || { name: 'Unknown Product' };

        html += `

            <div class="flex justify-between items-center text-[11px] font-bold border-b border-slate-50 dark:border-slate-800 pb-2">

                <span class="truncate pr-4 dark:text-slate-300">${product.name}</span>

                <span class="text-blue-500">${qty} Sold</span>

            </div>`;

    });

    html += '</div>';

    container.innerHTML = html;

}



function updateOperations(orders) {

    const pendingCount = orders.filter(o => o.status === 'pending').length;

    const opMsgs = document.querySelectorAll('.operation-item p');

    if (opMsgs.length > 0) {

        opMsgs[0].innerText = `Process ${pendingCount} pending orders`;

    }

}



// ৫. সিস্টেম ফাংশনসমূহ

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



    if (localStorage.getItem('sidebar-minimized') === 'true') {

        sidebar.classList.add('minimized');

        if (toggleIcon) toggleIcon.className = 'fas fa-chevron-right text-slate-400 text-xs';

    }

}



function handleAdminLogout() {

    if(confirm("Are you sure you want to logout?")) {

        sessionStorage.removeItem('adminAuth'); 

        window.location.href = 'admin-login.html'; 

    }

}



function initTheme() {

    const themeToggle = document.getElementById('theme-toggle');

    const themeIcon = document.getElementById('theme-icon');

    

    const applyTheme = (isDark) => {

        if (isDark) {

            document.documentElement.classList.add('dark');

            if (themeIcon) themeIcon.classList.replace('fa-moon', 'fa-sun');

        } else {

            document.documentElement.classList.remove('dark');

            if (themeIcon) themeIcon.classList.replace('fa-sun', 'fa-moon');

        }

    };



    // লোড করার সময় চেক

    applyTheme(localStorage.getItem('theme') === 'dark');



    if (themeToggle) {

        themeToggle.onclick = () => {

            const isDark = !document.documentElement.classList.contains('dark');

            applyTheme(isDark);

            localStorage.setItem('theme', isDark ? 'dark' : 'light');

            

            // চার্ট কালার আপডেট করার জন্য রি-রেন্ডার

            if(revenueChartInstance) renderCharts([]); // ডাটা থাকলে ডাটা পাস করবেন

        };

    }

}
