document.addEventListener('DOMContentLoaded', () => {
    const BASE_URL = 'https://website-production-f869.up.railway.app'; // আপনার সার্ভার URL
    const inventoryList = document.getElementById('inventory-list');
    const inventoryForm = document.getElementById('inventory-form');
    const modalTitle = document.getElementById('modal-title');
    const editIdInput = document.getElementById('edit-id');
    
    let products = [];

    function calculateDiscount(price, oldPrice) {
        if (!oldPrice || oldPrice <= price) return null;
        return Math.round(((oldPrice - price) / oldPrice) * 100);
    }

    function getStockBadge(stock) {
        if (stock <= 0) {
            return `<span class="px-3 py-1 bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 rounded-full text-[10px] font-bold ring-1 ring-rose-500/20">Out of Stock</span>`;
        } else if (stock <= 5) {
            return `<span class="px-3 py-1 bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400 rounded-full text-[10px] font-bold ring-1 ring-orange-500/20">Low Stock (${stock})</span>`;
        } else {
            return `<span class="px-3 py-1 bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-full text-[10px] font-bold ring-1 ring-emerald-500/20">In Stock (${stock})</span>`;
        }
    }

    // ১. সার্ভার থেকে সব প্রোডাক্ট নিয়ে আসা
    async function renderProducts() {
        try {
            const response = await fetch(`${BASE_URL}/products`);
            products = await response.json();

            if (products.length === 0) {
                inventoryList.innerHTML = `<tr><td colspan="4" class="py-10 text-center text-slate-400 uppercase text-xs font-bold tracking-widest">No products found</td></tr>`;
                return;
            }

            inventoryList.innerHTML = products.map((product, index) => {
                const discountPct = calculateDiscount(product.price, product.oldPrice);
                
                return `
                <tr class="border-b dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-white/5 transition">
                    <td class="py-4 px-2">
                        <div class="flex items-center gap-3 text-left">
                            <div class="relative">
                                <img src="${product.image}" class="w-12 h-12 rounded-lg object-cover bg-slate-100 border border-slate-200 dark:border-slate-700" onerror="this.src='https://via.placeholder.com/50'">
                                ${discountPct ? `<span class="absolute -top-2 -left-2 bg-rose-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full shadow-lg">-${discountPct}%</span>` : ''}
                            </div>
                            <div>
                                <p class="font-bold text-sm dark:text-white leading-tight">${product.name}</p>
                                <p class="text-[9px] text-slate-400 uppercase tracking-widest mt-1">ID: #TP-${product._id.slice(-4)}</p>
                            </div>
                        </div>
                    </td>
                    <td class="py-4 px-2">
                        <div class="text-left">
                            <span class="text-sm font-black text-blue-600 dark:text-rose-500">৳${product.price}</span>
                            ${product.oldPrice ? `<br><span class="text-[10px] text-slate-400 line-through">৳${product.oldPrice}</span>` : ''}
                        </div>
                    </td>
                    <td class="py-4 px-2">
                        <div class="text-left">
                            ${getStockBadge(product.stockQuantity)}
                        </div>
                    </td>
                    <td class="py-4 px-2 text-right">
                        <div class="flex items-center justify-end gap-1">
                            <button onclick="openEditModal('${product._id}')" class="w-8 h-8 rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-500/10 transition"><i class="fas fa-edit text-xs"></i></button>
                            <button onclick="deleteProduct('${product._id}')" class="w-8 h-8 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/10 transition"><i class="fas fa-trash text-xs"></i></button>
                        </div>
                    </td>
                </tr>`;
            }).join('');
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    }

    // ২. এডিট মোড ওপেন করা
    window.openEditModal = (id) => {
        const p = products.find(prod => prod._id === id);
        if (!p) return;

        modalTitle.innerText = "Edit Product Information";
        editIdInput.value = p._id; // MongoDB ID সেভ রাখা
        document.getElementById('p-name').value = p.name;
        document.getElementById('p-price').value = p.price;
        document.getElementById('p-oldPrice').value = p.oldPrice || '';
        document.getElementById('p-stock').value = p.stockQuantity;
        document.getElementById('p-image').value = p.image;
        document.getElementById('p-desc').value = p.description || '';
        toggleModal();
    };

    // ৩. প্রোডাক্ট সেভ বা আপডেট করা
    inventoryForm.onsubmit = async (e) => {
        e.preventDefault();
        
        const productData = {
            name: document.getElementById('p-name').value,
            price: parseFloat(document.getElementById('p-price').value),
            oldPrice: parseFloat(document.getElementById('p-oldPrice').value) || null,
            stock: parseInt(document.getElementById('p-stock').value),
            image: document.getElementById('p-image').value,
            desc: document.getElementById('p-desc').value
        };

        const editId = editIdInput.value;
        let url = `${BASE_URL}/admin/add-product`;
        let method = 'POST';

        if (editId) {
            url = `${BASE_URL}/admin/edit-product/${editId}`;
            method = 'PUT';
        }

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });

            if (response.ok) {
                inventoryForm.reset();
                editIdInput.value = "";
                modalTitle.innerText = "Product Details";
                toggleModal();
                renderProducts();
            }
        } catch (error) {
            console.error("Error saving product:", error);
        }
    };

    // ৪. প্রোডাক্ট ডিলিট করা
    window.deleteProduct = async (id) => {
        if (confirm('Are you sure you want to remove this item?')) {
            try {
                const response = await fetch(`${BASE_URL}/admin/delete-product/${id}`, {
                    method: 'DELETE'
                });
                if (response.ok) renderProducts();
            } catch (error) {
                console.error("Error deleting product:", error);
            }
        }
    };

    renderProducts();
});
