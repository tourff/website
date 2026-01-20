const BASE_URL = 'https://website-production-f869.up.railway.app';

function login() {
    if (document.getElementById('password').value === 'admin123') {
        alert("Success!");
        document.getElementById('login-box').style.display = 'none';
        document.getElementById('panel').style.display = 'block';
        loadProducts();
    } else { alert("Wrong Password!"); }
}

async function loadProducts() {
    const res = await fetch(`${BASE_URL}/products`);
    const products = await res.json();
    const list = document.getElementById('manage-list');
    list.innerHTML = '';
    products.forEach(p => {
        list.innerHTML += `<div class="flex justify-between items-center bg-gray-900/50 p-3 rounded-xl mb-2">
            <span class="text-sm">${p.name}</span>
            <button onclick="deleteProduct('${p._id}')" class="text-rose-500 hover:text-rose-700 font-bold">Delete</button>
        </div>`;
    });
}

async function deleteProduct(id) {
    if (!confirm("Delete?")) return;
    await fetch(`${BASE_URL}/admin/delete-product/${id}`, { method: 'DELETE' });
    loadProducts();
}

async function add() {
    const productData = {
        name: document.getElementById('name').value,
        price: document.getElementById('price').value,
        oldPrice: document.getElementById('oldPrice').value,
        customDiscount: document.getElementById('customDiscount').value,
        description: document.getElementById('description').value,
        image: document.getElementById('imgUrl').value
    };
    await fetch(`${BASE_URL}/admin/add-product`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(productData)
    });
    alert("Added!"); location.reload();
}
