document.addEventListener('DOMContentLoaded', () => {
    const inventoryList = document.getElementById('inventory-list');
    const inventoryForm = document.getElementById('inventory-form');
    const modalTitle = document.getElementById('modal-title');
    const editIdInput = document.getElementById('edit-id');
    
    let products = JSON.parse(localStorage.getItem('turjo_products')) || [];

    function calculateDiscount(price, oldPrice) {
        if (!oldPrice || oldPrice <= price) return null;
        return Math.round(((oldPrice - price) / oldPrice) * 100);
    }

    // স্টক স্ট্যাটাস এবং কালার কোডিং ফাংশন
    function getStockBadge(stock) {
        if (stock <= 0) {
            return `<span class="px-3 py-1 bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 rounded-full text-[10px] font-bold ring-1 ring-rose-500/20">Out of Stock</span>`;
        } else if (stock <= 5) {
            return `<span class="px-3 py-1 bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400 rounded-full text-[10px] font-bold ring-1 ring-orange-500/20">Low Stock (${stock})</span>`;
        } else {
            return `<span class="px-3 py-1 bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-full text-[10px] font-bold ring-1 ring-emerald-500/20">In Stock (${stock})</span>`;
        }
    }

    function renderProducts() {
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
                            <p class="text-[9px] text-slate-400 uppercase tracking-widest mt-1">ID: #TP-${1000 + index}</p>
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
                        ${getStockBadge(product.stock)}
                    </div>
                </td>
                <td class="py-4 px-2 text-right">
                    <div class="flex items-center justify-end gap-1">
                        <button onclick="openEditModal(${index})" class="w-8 h-8 rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-500/10 transition"><i class="fas fa-edit text-xs"></i></button>
                        <button onclick="deleteProduct(${index})" class="w-8 h-8 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/10 transition"><i class="fas fa-trash text-xs"></i></button>
                    </div>
                </td>
            </tr>
        `}).join('');
    }

    // --- অন্যান্য ফাংশন (Edit, Delete, Save) আগের মতোই থাকবে ---

    window.openEditModal = (index) => {
        const p = products[index];
        modalTitle.innerText = "Edit Product Information";
        editIdInput.value = index;
        document.getElementById('p-name').value = p.name;
        document.getElementById('p-price').value = p.price;
        document.getElementById('p-oldPrice').value = p.oldPrice || '';
        document.getElementById('p-stock').value = p.stock;
        document.getElementById('p-image').value = p.image;
        document.getElementById('p-desc').value = p.desc || '';
        toggleModal();
    };

    inventoryForm.onsubmit = (e) => {
        e.preventDefault();
        const updatedProduct = {
            name: document.getElementById('p-name').value,
            price: parseFloat(document.getElementById('p-price').value),
            oldPrice: parseFloat(document.getElementById('p-oldPrice').value) || null,
            stock: parseInt(document.getElementById('p-stock').value),
            image: document.getElementById('p-image').value,
            desc: document.getElementById('p-desc').value
        };

        const editIndex = editIdInput.value;
        if (editIndex === "") {
            products.push(updatedProduct);
        } else {
            products[editIndex] = updatedProduct;
            editIdInput.value = "";
        }

        localStorage.setItem('turjo_products', JSON.stringify(products));
        inventoryForm.reset();
        modalTitle.innerText = "Product Details";
        toggleModal();
        renderProducts();
    };

    window.deleteProduct = (index) => {
        if (confirm('Are you sure you want to remove this item?')) {
            products.splice(index, 1);
            localStorage.setItem('turjo_products', JSON.stringify(products));
            renderProducts();
        }
    };

    renderProducts();
});
