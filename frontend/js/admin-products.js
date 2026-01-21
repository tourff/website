const BASE_URL = 'https://website-production-f869.up.railway.app';

window.onload = () => {
    // সিকিউরিটি চেক
    if (localStorage.getItem('adminAuth') !== "turjo0424") {
        window.location.href = 'admin-login.html'; 
    } else {
        fetchInventory();
    }
};

// ইনভেন্টরি ডাটা নিয়ে আসা এবং টেবিল তৈরি করা
async function fetchInventory() {
    try {
        const res = await fetch(`${BASE_URL}/products`);
        const products = await res.json();
        const list = document.getElementById('inventory-list');
        
        list.innerHTML = products.map(p => {
            // স্টক স্ট্যাটাস কালার
            const stockColor = p.stockQuantity <= 0 ? 'text-rose-500 bg-rose-50 dark:bg-rose-900/10' : 
                               p.stockQuantity <= 5 ? 'text-orange-500 bg-orange-50 dark:bg-orange-900/10' : 
                               'text-green-500 bg-green-50 dark:bg-green-900/10';

            return `
                <tr class="border-b dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition">
                    <td class="py-6 px-2">
                        <div class="flex items-center gap-4">
                            <img src="${p.image}" class="w-12 h-12 rounded-xl object-cover shadow-sm">
                            <span class="font-bold text-sm">${p.name}</span>
                        </div>
                    </td>
                    <td class="py-6 px-2">
                        <p class="font-black text-blue-600 dark:text-rose-400 text-sm">৳${p.price}</p>
                        ${p.oldPrice ? `<p class="text-[10px] text-slate-400 line-through font-bold">৳${p.oldPrice}</p>` : ''}
                    </td>
                    <td class="py-6 px-2">
                        <span class="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${stockColor}">
                            ${p.stockQuantity <= 0 ? 'Out of Stock' : `${p.stockQuantity} In Stock`}
                        </span>
                    </td>
                    <td class="py-6 px-2 text-right space-x-2">
                        <button onclick="editProduct('${p._id}')" class="text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2.5 rounded-xl transition"><i class="fas fa-edit"></i></button>
                        <button onclick="deleteProduct('${p._id}')" class="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 p-2.5 rounded-xl transition"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (err) {
        console.error("Failed to load products:", err);
    }
}

// মোডাল কন্ট্রোল
function toggleModal() {
    document.getElementById('p-modal').classList.toggle('hidden');
    document.getElementById('inventory-form').reset();
    document.getElementById('edit-id').value = '';
    document.getElementById('modal-title').innerText = "Add Product";
}

// এডিট করার জন্য ডাটা ফেচ করা
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
            
            document.getElementById('modal-title').innerText = "Edit Product";
            document.getElementById('p-modal').classList.remove('hidden');
        }
    } catch (err) {
        console.error("Error fetching product details:", err);
    }
}

// ফর্ম সাবমিট (Add/Edit)
document.getElementById('inventory-form').onsubmit = async (e) => {
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
        console.error("Product save error:", err);
    }
};

// প্রোডাক্ট ডিলিট
async function deleteProduct(id) {
    if(confirm("Are you sure? This product will be deleted permanently!")) {
        try {
            const res = await fetch(`${BASE_URL}/admin/delete-product/${id}`, { method: 'DELETE' });
            if (res.ok) fetchInventory();
        } catch (err) {
            console.error("Delete error:", err);
        }
    }
}
