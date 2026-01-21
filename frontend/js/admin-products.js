const BASE_URL = 'https://website-production-f869.up.railway.app';

window.onload = () => {
    if (localStorage.getItem('adminAuth') !== "turjo0424") {
        window.location.href = 'admin-login.html';
    } else {
        fetchInventory();
    }
};

async function fetchInventory() {
    const res = await fetch(`${BASE_URL}/products`);
    const products = await res.json();
    const list = document.getElementById('inventory-list');
    
    list.innerHTML = products.map(p => {
        // ডিসকাউন্ট পার্সেন্টেজ হিসাব
        const discount = p.oldPrice && p.oldPrice > p.price 
            ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100) 
            : 0;

        return `
            <tr class="border-b dark:border-slate-800/50">
                <td class="py-6 px-2 font-bold text-sm">${p.name}</td>
                <td class="py-6 px-2 font-black text-blue-600">৳${p.price}</td>
                <td class="py-6 px-2">
                    ${discount > 0 ? `<span class="bg-rose-100 text-rose-500 text-[10px] px-2 py-1 rounded-full font-bold">-${discount}% OFF</span>` : '—'}
                </td>
                <td class="py-6 px-2 text-right">
                    <button onclick="editProduct('${p._id}')" class="text-blue-500 mr-4"><i class="fas fa-edit"></i></button>
                    <button onclick="deleteProduct('${p._id}')" class="text-rose-500"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `;
    }).join('');
}

function toggleModal() {
    document.getElementById('p-modal').classList.toggle('hidden');
    document.getElementById('inventory-form').reset();
    document.getElementById('edit-id').value = '';
}

async function editProduct(id) {
    const res = await fetch(`${BASE_URL}/products`);
    const products = await res.json();
    const p = products.find(item => item._id === id);
    if (p) {
        document.getElementById('edit-id').value = p._id;
        document.getElementById('p-name').value = p.name;
        document.getElementById('p-price').value = p.price;
        document.getElementById('p-oldPrice').value = p.oldPrice || '';
        document.getElementById('p-image').value = p.image;
        document.getElementById('p-desc').value = p.description || '';
        document.getElementById('p-modal').classList.remove('hidden');
    }
}

document.getElementById('inventory-form').onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-id').value;
    const data = {
        name: document.getElementById('p-name').value,
        price: Number(document.getElementById('p-price').value),
        oldPrice: Number(document.getElementById('p-oldPrice').value) || null,
        image: document.getElementById('p-image').value,
        description: document.getElementById('p-desc').value
    };
    await fetch(id ? `${BASE_URL}/admin/edit-product/${id}` : `${BASE_URL}/admin/add-product`, {
        method: id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    toggleModal();
    fetchInventory();
};

async function deleteProduct(id) {
    if(confirm("Delete product?")) {
        await fetch(`${BASE_URL}/admin/delete-product/${id}`, { method: 'DELETE' });
        fetchInventory();
    }
}
