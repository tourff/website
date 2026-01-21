const BASE_URL = 'https://website-production-f869.up.railway.app';
const ADMIN_PASS = "turjo0424";
let revenueChartInstance = null;

// ১. পেজ লোড হওয়ার পর এডমিন ভেরিফিকেশন এবং ইনিশিয়ালাইজেশন
window.onload = () => {
    const auth = localStorage.getItem('adminAuth');
    if (auth !== ADMIN_PASS) {
        const input = prompt("Enter Admin Password:");
        if (input === ADMIN_PASS) {
            localStorage.setItem('adminAuth', ADMIN_PASS);
            initAdmin();
        } else {
            // ভুল পাসওয়ার্ড দিলে মেইন সাইটে ফেরত পাঠাবে
            window.location.href = '../index.html'; 
        }
    } else {
        initAdmin();
    }
};

async function initAdmin() {
    // ড্যাশবোর্ড ডাটা ফেচ করা শুরু করবে
    refreshAllData();
}

// ২. ডাটাবেজ থেকে প্রোডাক্ট এবং অর্ডার তথ্য নিয়ে আসা
async function refreshAllData() {
    try {
        const [pRes, oRes] = await Promise.all([
            fetch(`${BASE_URL}/products`),
            fetch(`${BASE_URL}/orders`)
        ]);
        const products = await pRes.json();
        const orders = await oRes.json();
        
        // আপনার ভিডিওর ইন্টারফেস আইডি অনুযায়ী ডাটা বসানো
        updateDashboardStats(products, orders);
        
        // প্রোডাক্ট ও অর্ডার টেবিল আপডেট (যদি html-এ আইডিগুলো থাকে)
        if(document.getElementById('full-product-list')) updateProductTable(products);
        if(document.getElementById('full-orders-list')) updateOrdersList(orders);
        
    } catch (err) {
        console.error("Data refresh failed:", err);
    }
}

// ৩. ভিডিওর ইন্টারফেস অনুযায়ী Metrics আপডেট করা
function updateDashboardStats(products, orders) {
    // আপনার HTML ইন্টারফেসের আইডিগুলোর সাথে ডাটা ম্যাপিং
    
    // Today & This Month Section
    const totalRev = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
    const todayIncomeEl = document.getElementById('today-income');
    const monthOrdersEl = document.getElementById('month-orders');
    
    if (todayIncomeEl) todayIncomeEl.innerText = `৳${totalRev.toLocaleString()}`;
    if (monthOrdersEl) monthOrdersEl.innerText = `${orders.length} orders`;

    // Bottom Metrics Section (Total Orders, Revenue 30D, Avg Order Value)
    const totalOrders30dEl = document.getElementById('total-orders-30d');
    if (totalOrders30dEl) totalOrders30dEl.innerText = orders.length;

    const revenue30dEl = document.getElementById('revenue-30d');
    if (revenue30dEl) revenue30dEl.innerText = `৳${totalRev.toLocaleString()}`;

    const avgOrderValueEl = document.getElementById('avg-order-value');
    if (avgOrderValueEl) {
        const avg = orders.length > 0 ? (totalRev / orders.length).toFixed(0) : 0;
        avgOrderValueEl.innerText = `৳${avg}`;
    }

    // চার্ট রেন্ডার করা (যদি ক্যানভাস এলিমেন্ট থাকে)
    if(document.getElementById('revenueChart')) renderChart(orders);
}

// ৪. চার্ট রেন্ডারিং লজিক (Chart.js ব্যবহার করে)
function renderChart(orders) {
    const chartEl = document.getElementById('revenueChart');
    if (!chartEl) return;

    const ctx = chartEl.getContext('2d');
    if (revenueChartInstance) revenueChartInstance.destroy();
    
    // শেষ ৭টি অর্ডারের ডাটা গ্রাফে দেখাবে
    const data = orders.slice(-7); 
    
    revenueChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(o => o.orderedAt ? new Date(o.orderedAt).toLocaleDateString() : 'Date'),
            datasets: [{ 
                label: 'Revenue',
                data: data.map(o => o.totalAmount), 
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

// ৫. লগআউট ফাংশন (পাথ ফিক্সড)
function handleAdminLogout() {
    if(confirm("Logout from Admin Panel?")) {
        localStorage.removeItem('adminAuth');
        // এক ধাপ পিছিয়ে মেইন সাইটে ফেরত
        window.location.href = '../index.html'; 
    }
}
