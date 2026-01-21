// ইনভেন্টরি ডাটা নিয়ে আসা এবং টেবিল তৈরি করা
async function fetchInventory() {
    const list = document.getElementById('inventory-list');
    if (!list) return;

    // লোডিং ইন্ডিকেটর (ঐচ্ছিক)
    list.innerHTML = `<tr><td colspan="4" class="py-10 text-center text-slate-400 font-bold animate-pulse text-xs uppercase tracking-widest">Syncing Inventory...</td></tr>`;

    try {
        const res = await fetch(`${BASE_URL}/products`);
        const products = await res.json();
        
        if (products.length === 0) {
            list.innerHTML = `<tr><td colspan="4" class="py-10 text-center text-slate-400 font-bold uppercase text-xs tracking-widest">No Products Found</td></tr>`;
            return;
        }

        list.innerHTML = products.map(p => {
            // স্টক স্ট্যাটাস এবং কালার লজিক
            const isOutOfStock = p.stockQuantity <= 0;
            const stockColor = isOutOfStock ? 'text-rose-500 bg-rose-500/10 border-rose-500/20' : 
                               p.stockQuantity <= 5 ? 'text-orange-500 bg-orange-500/10 border-orange-500/20' : 
                               'text-green-500 bg-green-500/10 border-green-500/20';

            // টেবিল রো (Row) রিটার্ন করা
            return `
                <tr class="group border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all">
                    <td class="py-5 px-2">
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm flex-shrink-0">
                                <img src="${p.image}" class="w-full h-full object-cover" onerror="this.src='https://via.placeholder.com/50'">
                            </div>
                            <div class="text-left">
                                <p class="font-black text-sm text-slate-700 dark:text-slate-200">${p.name}</p>
                                <p class="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">UID: ${p._id.slice(-6)}</p>
                            </div>
                        </div>
                    </td>

                    <td class="py-5 px-2 text-left">
                        <p class="font-black text-slate-900 dark:text-white text-sm">৳${Number(p.price).toLocaleString()}</p>
                        ${p.oldPrice ? `<p class="text-[10px] text-slate-400 line-through font-bold">৳${Number(p.oldPrice).toLocaleString()}</p>` : ''}
                    </td>

                    <td class="py-5 px-2 text-left">
                        <span class="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter border ${stockColor}">
                            ${isOutOfStock ? 'OUT OF STOCK' : `${p.stockQuantity} IN STOCK`}
                        </span>
                    </td>

                    <td class="py-5 px-2 text-right">
                        <div class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <button onclick="editProduct('${p._id}')" class="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition flex items-center justify-center">
                                <i class="fas fa-edit text-xs"></i>
                            </button>
                            <button onclick="deleteProduct('${p._id}')" class="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition flex items-center justify-center">
                                <i class="fas fa-trash text-xs"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (err) {
        list.innerHTML = `<tr><td colspan="4" class="py-10 text-center text-rose-500 font-bold uppercase text-xs tracking-widest">Failed to sync with server</td></tr>`;
    }
}

// এডিট করার ডাটা ফেচ (Optimize করা হয়েছে)
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
        alert("Error loading product details");
    }
}
