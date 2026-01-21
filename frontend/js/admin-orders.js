const BASE_URL = 'https://website-production-f869.up.railway.app';

window.onload = () => {
    if (localStorage.getItem('adminAuth') !== "turjo0424") {
        window.location.href = 'admin-login.html';
    } else {
        fetchOrders();
    }
};

async function fetchOrders() {
    try {
        const res = await fetch(`${BASE_URL}/orders`);
        const orders = await res.json();
        const list = document.getElementById('order-list-body');
        
        list.innerHTML = orders.map(o => `
            <tr class="border-b dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition">
                <td class="py-6 px-2">
                    <p class="font-bold text-sm">${o.userName}</p>
                    <p class="text-[10px] text-slate-400 font-medium">${new Date(o.orderedAt).toLocaleString()}</p>
                </td>
                <td class="py-6 px-2 font-black text-blue-600">৳${o.totalAmount}</td>
                <td class="py-6 px-2">
                    <span class="status-badge ${o.status === 'Success' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}">
                        ${o.status || 'Pending'}
                    </span>
                </td>
                <td class="py-6 px-2 text-right space-x-2">
                    <button onclick="updateStatus('${o._id}', 'Success')" class="text-green-500 hover:bg-green-50 p-2 rounded-lg transition" title="Mark Success"><i class="fas fa-check-circle"></i></button>
                    <button onclick="deleteOrder('${o._id}')" class="text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition" title="Delete"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error("Order load failed:", err);
    }
}

async function updateStatus(id, status) {
    if(confirm(`Update order status to ${status}?`)) {
        await fetch(`${BASE_URL}/admin/update-order/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        fetchOrders();
    }
}

async function deleteOrder(id) {
    if(confirm("Are you sure you want to delete this order?")) {
        await fetch(`${BASE_URL}/admin/delete-order/${id}`, { method: 'DELETE' });
        fetchOrders();
    }
}
