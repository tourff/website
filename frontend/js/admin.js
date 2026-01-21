const BASE_URL = 'https://website-production-f869.up.railway.app';
const ADMIN_PASS = "turjo0424";
let revenueChartInstance = null;

window.onload = () => {
    const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
    const dateEl = document.getElementById('current-date');
    if (dateEl) dateEl.innerText = new Date().toLocaleDateString('en-US', options);

    const auth = sessionStorage.getItem('adminAuth'); 
    
    if (auth !== ADMIN_PASS) {
        window.location.href = 'admin-login.html'; 
    } else {
        // রিফ্রেশ প্রোটেকশন: ড্যাশবোর্ড লোড হওয়ার সাথে সাথে সেশন ক্লিয়ার করা
        sessionStorage.removeItem('adminAuth'); 

        initDashboard();
        initTheme(); 
        initNavigation(); 
    }
};

// ২. নেভিগেশন লজিক (সবগুলো এখানে যুক্ত করা হয়েছে)
function initNavigation() {
    // ক) Products পেজ নেভিগেশন
    const prodCard = document.querySelector('.action-card i.fa-box')?.parentElement;
    if (prodCard) prodCard.onclick = () => {
        sessionStorage.setItem('adminAuth', ADMIN_PASS);
        window.location.href = 'admin-products.html';
    };

    // খ) Orders পেজ নেভিগেশন
    const orderCard = document.querySelector('.action-card i.fa-shopping-cart')?.parentElement;
    if (orderCard) orderCard.onclick = () => {
        sessionStorage.setItem('adminAuth', ADMIN_PASS);
        window.location.href = 'admin-orders.html';
    };

    // গ) Slider ম্যানেজমেন্ট পেজ নেভিগেশন
    const sliderCard = document.querySelector('.action-card i.fa-comments')?.parentElement || 
                       document.querySelector('.action-card i.fa-images')?.parentElement;
    if (sliderCard) {
        sliderCard.innerHTML = `
            <i class="fas fa-images text-purple-500 text-xl"></i>
            <span class="text-[10px] font-bold uppercase">Slider</span>
        `;
        sliderCard.onclick = () => {
            sessionStorage.setItem('adminAuth', ADMIN_PASS);
            window.location.href = 'admin-slider.html';
        };
    }

    // ঘ) User Intelligence পেজ নেভিগেশন (নতুন যোগ করা হয়েছে)
    const intelligenceCard = document.querySelector('.action-card i.fa-brain')?.parentElement || 
                             document.querySelector('.action-card i.fa-chart-line')?.parentElement;
    if (intelligenceCard) {
        intelligenceCard.onclick = () => {
            // সিকিউরিটি বজায় রাখতে সেশন আবার সেট করা
            sessionStorage.setItem('adminAuth', ADMIN_PASS); 
            window.location.href = 'admin-intelligence.html'; 
        };
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
        renderChart(orders);
        checkStockStatus(products); 
        
    } catch (err) {
        console.error("Dashboard Sync Failed:", err);
    }
}

function checkStockStatus(products) {
    const outOfStockItems = products.filter(p => p.stockQuantity <= 0);
    const alertBox = document.getElementById('stock-alert-container');
    const alertMsg = document.getElementById('stock-alert-msg');

    if (outOfStockItems.length > 0 && alertBox) {
        alertBox.classList.remove('hidden');
        alertMsg.innerText = `${outOfStockItems.length} items are currently out of stock! Please refill.`;
    } else if (alertBox) {
        alertBox.classList.add('hidden');
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
    if (orderCountEl) orderCountEl.innerText = `${orders.length} orders`;
}

function renderChart(orders) {
    const chartCanvas = document.getElementById('revenueChart');
    if (!chartCanvas) return;
    const ctx = chartCanvas.getContext('2d');
    if (revenueChartInstance) revenueChartInstance.destroy();
    
    const last7Orders = orders.slice(-7); 
    const isDark = document.documentElement.classList.contains('dark');
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0,0,0,0.05)';
    const textColor = isDark ? '#94a3b8' : '#64748b';
    
    revenueChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: last7Orders.map(o => new Date(o.orderedAt).toLocaleDateString()),
            datasets: [{ 
                label: 'Revenue',
                data: last7Orders.map(o => o.totalAmount), 
                borderColor: isDark ? '#f43f5e' : '#2563eb',
                backgroundColor: isDark ? 'rgba(244, 63, 94, 0.1)' : 'rgba(37, 99, 235, 0.1)',
                tension: 0.4, 
                fill: true 
            }]
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false, 
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: textColor } },
                x: { grid: { display: false }, ticks: { color: textColor } }
            }
        }
    });
}

function handleAdminLogout() {
    if(confirm("Are you sure?")) {
        sessionStorage.removeItem('adminAuth'); 
        window.location.href = 'admin-login.html'; 
    }
}
