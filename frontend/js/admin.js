const BASE_URL = 'https://website-production-f869.up.railway.app';
const ADMIN_PASS = "turjo0424";
let revenueChartInstance = null;

// এডমিন এক্সেস চেক
window.onload = () => {
    const auth = localStorage.getItem('adminAuth');
    if (auth !== ADMIN_PASS) {
        const input = prompt("Enter Admin Password:");
        if (input === ADMIN_PASS) {
            localStorage.setItem('adminAuth', ADMIN_PASS);
            initAdmin();
        } else {
            window.location.href = 'index.html';
        }
    } else {
        initAdmin();
    }
};

async function initAdmin() {
    document.getElementById('admin-main-content').classList.remove('hidden');
    await refreshData();
}

async function refreshData() {
    const [pRes, oRes] = await Promise.all([
        fetch(`${BASE_URL}/products`),
        fetch(`${BASE_URL}/orders`)
    ]);
    const products = await pRes.json();
    const orders = await oRes.json();
    
    updateStats(products, orders);
    renderProductTable(products);
}

// সেকশন সুইচিং লজিক (ভিডিওর মতো)
function showSection(sec) {
    document.getElementById('dashboard-sec').classList.add('hidden');
    document.getElementById('products-sec').classList.add('hidden');
    document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));

    if(sec === 'dashboard') {
        document.getElementById('dashboard-sec').classList.remove('hidden');
        document.getElementById('m-dashboard').classList.add('active');
    } else if(sec === 'products') {
        document.getElementById('products-sec').classList.remove('hidden');
        document.getElementById('m-products').classList.add('active');
    }
}

// প্রোডাক্ট টেবিল রেন্ডার
function renderProductTable(products) {
    const container = document.getElementById('full-product-list');
    container.innerHTML = products.map(p => `
        <tr class="border-b border-white/5 hover:bg-white/5 transition">
            <td class="p-6 flex items-center gap-4">
                <img src="${p.image}" class="w-10 h-10 object-contain bg-white/5 rounded-lg">
                <span class="font-bold text-xs">${p.name}</span>
            </td>
            <td class="p-6 text-xs font-bold text-rose-500">৳${p.price}</td>
            <td class="p-6 text-xs text-gray-500">${p.stockQuantity}</td>
            <td class="p-6 text-right">
                <button onclick="deleteProduct('${p._id}')" class="text-gray-600 hover:text-rose-500 transition mx-2"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

// প্রোডাক্ট ডিলিট ফাংশন
async function deleteProduct(id) {
    if(confirm("Delete this product?")) {
        await fetch(`${BASE_URL}/admin/delete-product/${id}`, { method: 'DELETE' });
        refreshData();
    }
}

// নতুন প্রোডাক্ট সেভ করা
document.getElementById('add-product-form').onsubmit = async (e) => {
    e.preventDefault();
    const newP = {
        name: document.getElementById('add-name').value,
        price: Number(document.getElementById('add-price').value),
        oldPrice: Number(document.getElementById('add-oldPrice').value),
        image: document.getElementById('add-image').value,
        description: document.getElementById('add-desc').value
    };

    await fetch(`${BASE_URL}/admin/add-product`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newP)
    });
    
    toggleModal('add-modal');
    refreshData();
};

function updateStats(products, orders) {
    document.getElementById('product-count').innerText = products.length;
    document.getElementById('order-count').innerText = orders.length;
    const rev = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
    document.getElementById('total-revenue').innerText = `৳${rev.toLocaleString()}`;
    
    // Mini orders list for dashboard
    document.getElementById('orders-list-mini').innerHTML = orders.slice(0, 4).map(o => `
        <div class="flex justify-between items-center border-b border-white/5 pb-4">
            <div><p class="text-[10px] font-bold uppercase">${o.userName}</p><p class="text-[8px] text-gray-600">${new Date(o.orderedAt).toLocaleDateString()}</p></div>
            <p class="text-[10px] font-bold text-rose-500">৳${o.totalAmount}</p>
        </div>
    `).join('');

    renderChart(orders);
}

function renderChart(orders) {
    const ctx = document.getElementById('revenueChart').getContext('2d');
    if (revenueChartInstance) revenueChartInstance.destroy();
    const data = orders.slice(0, 7).reverse();
    revenueChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(o => new Date(o.orderedAt).toLocaleDateString()),
            datasets: [{ data: data.map(o => o.totalAmount), borderColor: '#f43f5e', tension: 0.4, fill: true, backgroundColor: 'rgba(244, 63, 94, 0.05)' }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { display: false }, x: { grid: { display: false } } } }
    });
}

function toggleModal(id) { document.getElementById(id).classList.toggle('hidden'); }
function handleAdminLogout() { localStorage.removeItem('adminAuth'); window.location.reload(); }
