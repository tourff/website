const BASE_URL = 'https://website-production-f869.up.railway.app';

// ১. ড্যাশবোর্ড ডাটা ফেচ করা
async function loadDashboard() {
    try {
        const [pRes, oRes] = await Promise.all([
            fetch(`${BASE_URL}/products`),
            fetch(`${BASE_URL}/orders`)
        ]);

        const products = await pRes.json();
        const orders = await oRes.json();

        updateUI(products, orders);
    } catch (err) {
        console.error("Dashboard Load Error:", err);
    }
}

// ২. ইন্টারফেস আপডেট করা
function updateUI(products, orders) {
    // স্ট্যাটাস কার্ডস আপডেট
    document.getElementById('product-count').innerText = products.length; //
    document.getElementById('order-count').innerText = orders.length; //

    // মোট ইনকাম ক্যালকুলেশন
    const revenue = orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
    document.getElementById('total-revenue').innerText = `৳${revenue.toLocaleString()}`; //

    // আজকের ইনকাম
    const today = new Date().toLocaleDateString();
    const todayOrders = orders.filter(o => new Date(o.orderedAt).toLocaleDateString() === today);
    const todayRevenue = todayOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
    document.getElementById('today-sales').innerText = `৳${todayRevenue.toLocaleString()}`; //

    // অর্ডার লিস্ট (ভিডিওর মতো স্টাইলিশ)
    const list = document.getElementById('orders-list');
    list.innerHTML = orders.slice(0, 5).map(o => `
        <div class="flex items-center justify-between group">
            <div class="flex items-center gap-4">
                <div class="w-9 h-9 bg-white/5 rounded-xl flex items-center justify-center text-gray-500 group-hover:text-rose-500 transition">
                    <i class="fas fa-shopping-cart text-xs"></i>
                </div>
                <div>
                    <p class="text-[11px] font-black uppercase text-white tracking-tight">${o.userName}</p>
                    <p class="text-[8px] text-gray-600 font-bold uppercase">${new Date(o.orderedAt).toLocaleDateString()}</p>
                </div>
            </div>
            <div class="text-right">
                <p class="text-[11px] font-black text-white">৳${o.totalAmount}</p>
                <p class="text-[7px] text-rose-500 font-black uppercase tracking-widest">${o.status || 'Pending'}</p>
            </div>
        </div>
    `).join(''); //

    renderChart(orders);
}

// ৩. গ্রাফ রেন্ডারিং (ভিডিওর মতো স্মুথ কার্ভ)
function renderChart(orders) {
    const ctx = document.getElementById('revenueChart').getContext('2d');
    
    // লাস্ট ৫টি অর্ডারের ডাটা
    const chartData = orders.slice(0, 5).reverse();
    const labels = chartData.map(o => new Date(o.orderedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }));
    const values = chartData.map(o => o.totalAmount);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                borderColor: '#f43f5e',
                borderWidth: 4,
                pointRadius: 0,
                backgroundColor: 'rgba(244, 63, 94, 0.1)',
                fill: true,
                tension: 0.4 // স্মুথ গ্রাফ
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { display: false },
                x: { 
                    grid: { display: false },
                    ticks: { color: '#4b5563', font: { size: 9, weight: 'bold' } }
                }
            }
        }
    });
}

function logout() {
    if(confirm("Logout from Admin Panel?")) {
        window.location.href = 'index.html';
    }
}

// ইনিশিয়াল কল
document.addEventListener('DOMContentLoaded', loadDashboard);
