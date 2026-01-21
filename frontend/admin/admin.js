const BASE_URL = 'https://website-production-f869.up.railway.app';
const ADMIN_PASS = "turjo0424";
let revenueChartInstance = null;

window.onload = () => {
    const auth = localStorage.getItem('adminAuth');
    if (auth !== ADMIN_PASS) {
        const input = prompt("Enter Admin Password:");
        if (input === ADMIN_PASS) {
            localStorage.setItem('adminAuth', ADMIN_PASS);
            initAdmin();
        } else {
            window.location.href = '../index.html';
        }
    } else {
        initAdmin();
    }
};

async function initAdmin() {
    document.getElementById('admin-main-content').classList.remove('hidden');
    refreshAllData();
}

function showSection(sectionName) {
    const secs = ['dashboard', 'products', 'orders'];
    secs.forEach(s => {
        document.getElementById(`sec-${s}`).classList.add('hidden');
        document.getElementById(`m-${s}`).classList.remove('active');
    });
    document.getElementById(`sec-${sectionName}`).classList.remove('hidden');
    document.getElementById(`m-${sectionName}`).classList.add('active');
    refreshAllData();
}

async function refreshAllData() {
    const [pRes, oRes] = await Promise.all([
        fetch(`${BASE_URL}/products`),
        fetch(`${BASE_URL}/orders`)
    ]);
    const products = await pRes.json();
    const orders = await oRes.json();
    
    updateDashboardStats(products, orders);
    updateProductTable(products);
    updateOrdersList(orders);
}

function updateDashboardStats(products, orders) {
    document.getElementById('product-count').innerText = products.length;
    document.getElementById('order-count').innerText = orders.length;
    const rev = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
    document.getElementById('total-revenue').innerText = `৳${rev.toLocaleString()}`;
    
    document.getElementById('orders-list-mini').innerHTML = orders.slice(0, 4).map(o => `
        <div class="flex justify-between border-b border-white/5 pb-4">
            <div><p class="text-[10px] font-bold uppercase text-white">${o.userName}</p></div>
            <p class="text-[10px] font-bold text-rose-500">৳${o.totalAmount}</p>
        </div>`).join('');
    renderChart(orders);
}

function updateProductTable(products) {
    document.getElementById('full-product-list').innerHTML = products.map(p => `
        <tr class="border-b border-white/5">
            <td class="p-6 text-xs font-bold">${p.name}</td>
            <td class="p-6 text-xs text-rose-500">৳${p.price}</td>
            <td class="p-6 text-right">
                <button onclick="deleteProduct('${p._id}')" class="text-gray-500 hover:text-rose-500"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`).join('');
}

function updateOrdersList(orders) {
    document.getElementById('full-orders-list').innerHTML = orders.map(o => `
        <div class="glass-card p-6 rounded-3xl flex justify-between items-center">
            <p class="text-xs font-bold">${o.userName} - ৳${o.totalAmount}</p>
            <p class="text-[9px] uppercase font-black text-rose-500">${o.status || 'Pending'}</p>
        </div>`).join('');
}

async function deleteProduct(id) {
    if(confirm("Delete product?")) {
        await fetch(`${BASE_URL}/admin/delete-product/${id}`, { method: 'DELETE' });
        refreshAllData();
    }
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
