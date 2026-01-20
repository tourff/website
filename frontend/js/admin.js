const API_URL = 'https://website-production-f869.up.railway.app';

async function loadAdminProducts() {
    const list = document.getElementById('admin-product-list');
    if (!list) return;

    try {
        const res = await fetch(`${API_URL}/products`);
        const products = await res.json();

        // products একটি অ্যারে কি না তা নিশ্চিত করা
        if (Array.isArray(products)) {
            list.innerHTML = products.length === 0 ? '<p class="text-xs text-gray-500 uppercase">No Data in DB</p>' : '';
            products.forEach(p => {
                list.innerHTML += `
                    <div class="bg-[#161021] p-4 rounded-xl flex items-center justify-between border border-white/5 mb-3">
                        <span class="font-bold text-[10px] uppercase truncate w-40 text-gray-300">${p.name}</span>
                        <button onclick="deleteProduct('${p._id}')" class="p-2 bg-red-600/10 text-red-500 rounded border border-red-600/20 hover:bg-red-600 hover:text-white transition">
                            <i class="fas fa-trash-alt text-[10px]"></i>
                        </button>
                    </div>`;
            });
        }
    } catch (err) {
        list.innerHTML = '<p class="text-red-500 text-[10px] uppercase font-bold">Database connection failed.</p>';
    }
}

window.deleteProduct = async function(id) {
    if(confirm("Confirm Delete?")) {
        const res = await fetch(`${API_URL}/admin/delete-product/${id}`, { method: 'DELETE' });
        if(res.ok) loadAdminProducts();
    }
}

loadAdminProducts();
