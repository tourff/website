const BASE_URL = 'https://website-production-f869.up.railway.app';

window.onload = () => {
    // ড্যাশবোর্ডের মতো এখানেও সিকিউরিটি চেক
    const auth = sessionStorage.getItem('adminAuth'); 
    if (auth !== "turjo0424") {
        window.location.href = 'admin-login.html'; 
    } else {
        fetchOrders();
    }
};

async function fetchOrders() {
    const listBody = document.getElementById('order-list-body');
    if (!listBody) return;

    try {
        // লোডিং মেসেজ (ঐচ্ছিক)
        listBody.innerHTML = `<tr><td colspan="4" class="py-10 text-center text-slate-400 font-bold tracking-widest uppercase text-[10px]">Loading Orders...</td></tr>`;

        const res = await fetch(`${BASE_URL}/orders`);
        
        if (!res.ok) throw new Error("Server response not OK");
        
        const orders = await res.json();

        if (orders.length === 0) {
            listBody.innerHTML = `<tr><td colspan="4" class="py-10 text-center text-slate-400 font-bold tracking-widest uppercase text-[10px]">No Orders Found</td></tr>`;
            return;
        }

        // অর্ডারগুলোকে তারিখ অনুযায়ী সাজানো (নতুনগুলো আগে)
        orders.sort((a, b) => new Date(b.orderedAt) - new Date(a.orderedAt));

        listBody.innerHTML = orders.map(o => `
            <tr class="border-b dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition">
                <td class="py-6 px-2 text-left">
                    <p class="font-bold text-sm dark:text-white">${o.userName || 'Unknown'}</p>
                    <p class="text-[10px] text-slate-400 font-medium">${new Date(o.orderedAt).toLocaleString()}</p>
                </td>
                <td class="py-6 px-2 text-left">
                    <p class="font-black text-blue-600 dark:text-rose-400 text-sm">৳${o.totalAmount || 0}</p>
                </td>
                <td class="py-6 px-2 text-left">
                    <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider 
                        ${o.status === 'Success' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}">
                        ${o.status || 'Pending'}
                    </span>
                </td>
                <td class="py-6 px-2 text-right space-x-2">
                    <button onclick="updateStatus('${o._id}', 'Success')" class="text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 p-2.5 rounded-xl transition" title="Mark Success">
                        <i class="fas fa-check-circle"></i>
                    </button>
                    <button onclick="deleteOrder('${o._id}')" class="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 p-2.5 rounded-xl transition" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');

    } catch (err) {
        console.error("Order Load Error:", err);
        listBody.innerHTML = `<tr><td colspan="4" class="py-10 text-center text-rose-500 font-bold uppercase text-[10px]">Failed to load orders. Check Console.</td></tr>`;
    }
}

// অর্ডার স্ট্যাটাস আপডেট লজিক
async function updateStatus(id, status) {
    if(confirm(`Mark this order as ${status}?`)) {
        try {
            const res = await fetch(`${BASE_URL}/admin/update-order/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            if (res.ok) fetchOrders();
        } catch (err) {
            alert("Status update failed!");
        }
    }
}

// অর্ডার ডিলিট লজিক
async function deleteOrder(id) {
    if(confirm("Permanently delete this order?")) {
        try {
            const res = await fetch(`${BASE_URL}/admin/delete-order/${id}`, { method: 'DELETE' });
            if (res.ok) fetchOrders();
        } catch (err) {
            alert("Delete failed!");
        }
    }
}
