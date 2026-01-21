// ইনভেন্টরি ডাটা নিয়ে আসা এবং স্ক্রিনশটের মতো টেবিল তৈরি করা
async function fetchInventory() {
    const list = document.getElementById('inventory-list');
    if (!list) return;

    try {
        const res = await fetch(`${BASE_URL}/products`);
        const products = await res.json();
        
        list.innerHTML = products.map(p => {
            // স্টক স্ট্যাটাস এবং কালার লজিক
            const isOutOfStock = p.stockQuantity <= 0;
            const stockColor = isOutOfStock ? 'text-rose-500 bg-rose-500/10 border-rose-500/20' : 
                               p.stockQuantity <= 5 ? 'text-orange-500 bg-orange-500/10 border-orange-500/20' : 
                               'text-green-500 bg-green-500/10 border-green-500/20';

            return `
                <div class="grid grid-cols-12 gap-4 py-6 items-center px-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition rounded-2xl group">
                    <div class="col-span-5 flex items-center gap-4">
                        <div class="w-12 h-12 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm">
                            <img src="${p.image}" class="w-full h-full object-cover" onerror="this.src='https://via.placeholder.com/50'">
                        </div>
                        <span class="font-black text-sm text-slate-700 dark:text-slate-200">${p.name}</span>
                    </div>

                    <div class="col-span-2 text-center">
                        <p class="font-black text-slate-900 dark:text-white text-sm">৳${p.price.toLocaleString()}</p>
                        ${p.oldPrice ? `<p class="text-[10px] text-slate-400 line-through font-bold">৳${p.oldPrice.toLocaleString()}</p>` : ''}
                    </div>

                    <div class="col-span-3 text-center">
                        <span class="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter border ${stockColor}">
                            ${isOutOfStock ? 'OUT OF STOCK' : `${p.stockQuantity} IN STOCK`}
                        </span>
                    </div>

                    <div class="col-span-2 text-right space-x-2 opacity-0 group-hover:opacity-100 transition">
                        <button onclick="editProduct('${p._id}')" class="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition inline-flex items-center justify-center">
                            <i class="fas fa-edit text-xs"></i>
                        </button>
                        <button onclick="deleteProduct('${p._id}')" class="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition inline-flex items-center justify-center">
                            <i class="fas fa-trash text-xs"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    } catch (err) {
        list.innerHTML = `<p class="py-10 text-center text-rose-500 font-bold uppercase text-xs tracking-widest">Failed to sync with server</p>`;
    }
}

// মোডাল কন্ট্রোল
function toggleModal() {
    const modal = document.getElementById('p-modal');
    if (!modal) return;
    modal.classList.toggle('hidden');
    if (modal.classList.contains('hidden')) {
        document.getElementById('inventory-form').reset();
        document.getElementById('edit-id').value = '';
        document.getElementById('modal-title').innerText = "Product Details";
    }
}

// এডিট করার ডাটা ফেচ
async function editProduct(id) {
    try {
        const res = await fetch(`${BASE_URL}/products`);
        const products = await res.json();
        const p = products.find(item => item._id === id);
        if (p) {
            document.getElementById('edit-id').value = p._id;
            document.getElementById('p-name').value = p.name;
            document.getElementById('p-price').value = p.price;
            document.getElementById('p-oldPrice').value = p.oldPrice || '';
            document.getElementById('p-stock').value = p.stockQuantity || 0;
            document.getElementById('p-image').value = p.image;
            document.getElementById('p-desc').value = p.description || '';
            
            document.getElementById('modal-title').innerText = "Update Product";
            document.getElementById('p-modal').classList.remove('hidden');
        }
    } catch (err) {
        console.error("Fetch error:", err);
    }
}

// প্রোডাক্ট ডিলিট ফাংশন
async function deleteProduct(id) {
    if(confirm("Confirm deletion? This cannot be undone.")) {
        try {
            const res = await fetch(`${BASE_URL}/admin/delete-product/${id}`, { method: 'DELETE' });
            if (res.ok) fetchInventory();
        } catch (err) {
            console.error("Delete error:", err);
        }
    }
}

// ফর্ম সাবমিট (Add/Edit) লজিক
document.addEventListener('submit', async (e) => {
    if (e.target && e.target.id === 'inventory-form') {
        e.preventDefault();
        const id = document.getElementById('edit-id').value;
        const data = {
            name: document.getElementById('p-name').value,
            price: Number(document.getElementById('p-price').value),
            oldPrice: Number(document.getElementById('p-oldPrice').value) || null,
            stockQuantity: Number(document.getElementById('p-stock').value),
            image: document.getElementById('p-image').value,
            description: document.getElementById('p-desc').value,
            inStock: Number(document.getElementById('p-stock').value) > 0
        };

        const url = id ? `${BASE_URL}/admin/edit-product/${id}` : `${BASE_URL}/admin/add-product`;
        const method = id ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                toggleModal();
                fetchInventory();
            }
        } catch (err) {
            console.error("Save error:", err);
        }
    }
});
