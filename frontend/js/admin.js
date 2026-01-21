const BASE_URL = 'https://website-production-f869.up.railway.app';
const ADMIN_PASS = "turjo0424";
let revenueChartInstance = null;

window.onload = () => {
    // হেডার ডেট সেট করা
    const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
    document.getElementById('current-date').innerText = new Date().toLocaleDateString('en-US', options);

    // সিকিউরিটি চেক
    const auth = localStorage.getItem('adminAuth');
    if (auth !== ADMIN_PASS) {
        const input = prompt("Enter Admin Password:");
        if (input === ADMIN_PASS) {
            localStorage.setItem('adminAuth', ADMIN_PASS);
            initDashboard();
        } else {
            window.location.href = '../index.html'; // ভুল পাসওয়ার্ডে হোম পেজে ফেরা
        }
    } else {
        initDashboard();
    }
};

async function initDashboard() {
    refreshData();
    setInterval(refreshData, 30000); // প্রতি ৩০ সেকেন্ড পর পর অটো আপডেট
}

async function refreshData() {
    try {
        const response = await fetch(`${BASE_URL}/orders`);
        const orders = await response.json();
        
        updateStats(orders);
        renderChart(orders);
        
    } catch (err) {
        console.error("Dashboard Sync Failed:", err);
    }
}

function updateStats(orders) {
    // আজকের আয়ের হিসাব (Revenue)
    const startOfToday = new Date();
    startOfToday.setHours(0,0,0,0);
    const todayOrders = orders.filter(o => new Date(o.orderedAt) >= startOfToday);
    const todayRev = todayOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);
    
    document.getElementById('today-income').innerText = `৳${todayRev.toLocaleString()}`;
    document.getElementById('month-orders').innerText = `${orders.length} orders`;
}

function renderChart(orders) {
    const ctx = document.getElementById('revenueChart').getContext('2d');
    if (revenueChartInstance) revenueChartInstance.destroy();
    
    const last7Orders = orders.slice(-7); 
    
    revenueChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: last7Orders.map(o => new Date(o.orderedAt).toLocaleDateString()),
            datasets: [{ 
                label: 'Revenue Growth',
                data: last7Orders.map(o => o.totalAmount), 
                borderColor: '#2563eb', 
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                tension: 0.4, 
                fill: true 
            }]
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false, 
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
                x: { grid: { display: false } }
            }
        }
    });
}

function handleAdminLogout() {
    if(confirm("Are you sure you want to logout?")) {
        localStorage.removeItem('adminAuth');
        window.location.href = '../index.html'; // লগআউট করে মূল পেজে ফেরা
    }
}
