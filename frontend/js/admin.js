const BASE_URL = 'https://website-production-f869.up.railway.app';

// ১. লগইন ফাংশন
function login() {
    const password = document.getElementById('password').value;
    if (password === 'admin123') {
        alert("Login Success!");
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('admin-section').style.display = 'block';
        loadAdminProducts();
        loadAdminBanners(); // ব্যানার লিস্ট লোড করার জন্য
    } else {
        alert("Wrong Password!");
    }
}

// ২. প্রোডাক্ট অ্যাড করার ফাংশন
async function addProduct() {
    const name = document.getElementById('name').value;
    const price = document.getElementById('price').value;
    const image = document.getElementById('imgUrl').value;

    if (!name || !price || !image) return alert("Fill all fields!");

    try {
        const response = await fetch(`${BASE_URL}/admin/add-product`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, price, image })
        });
        if (response.ok) {
            alert("Product Added!");
            loadAdminProducts();
            document.getElementById('name').value = '';
            document.getElementById('price').value = '';
            document.getElementById('imgUrl').value = '';
        }
    } catch (err) { console.error(err); }
}

// ৩. সব প্রোডাক্ট লিস্ট লোড করা
async function loadAdminProducts() {
    const list = document.getElementById('admin-product-list');
    try {
        const res = await fetch(`${BASE_URL}/products`);
        const products = await res.json();
        list.innerHTML = '';
        products.forEach(p => {
            list.innerHTML += `
                <div class="flex items-center justify-between bg-gray-900 p-4 rounded-xl mb-2 border border-gray-800">
                    <div class="flex items-center gap-4">
                        <img src="${p.image}" class="w-10 h-10 object-contain">
                        <div>
                            <h4 class="text-sm font-bold text-white">${p.name}</h4>
                            <p class="text-[10px] ${p.inStock ? 'text-green-500' : 'text-red-500'} font-bold uppercase">${p.inStock ? 'In Stock' : 'Out of Stock'}</p>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="toggleStock('${p._id}')" class="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-[10px] font-bold text-white transition">Stock</button>
                        <button onclick="deleteProduct('${p._id}')" class="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-[10px] font-bold text-white transition">Delete</button>
                    </div>
                </div>`;
        });
    } catch (err) { console.error(err); }
}

// ৪. ব্যানার অ্যাড করার ফাংশন
async function addBanner() {
    const imageUrl = document.getElementById('bannerUrl').value;
    const displayTime = document.getElementById('displayTime').value || 5000;

    if (!imageUrl) return alert("Please provide a Banner URL");

    try {
        const response = await fetch(`${BASE_URL}/admin/add-banner`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageUrl, displayTime })
        });
        if (response.ok) {
            alert("Banner Added!");
            loadAdminBanners();
            document.getElementById('bannerUrl').value = '';
            document.getElementById('displayTime').value = '';
        }
    } catch (err) { console.error(err); }
}

// ৫. সব ব্যানার লিস্ট লোড করা
async function loadAdminBanners() {
    const list = document.getElementById('admin-banner-list');
    try {
        const res = await fetch(`${BASE_URL}/banners`);
        const banners = await res.json();
        list.innerHTML = '';
        banners.forEach(b => {
            list.innerHTML += `
                <div class="flex items-center justify-between bg-gray-900 p-3 rounded-xl mb-2 border border-gray-800">
                    <img src="${b.imageUrl}" class="w-20 h-10 object-cover rounded">
                    <button onclick="deleteBanner('${b._id}')" class="text-red-500 hover:text-red-400 text-xs font-bold uppercase px-2 py-1 transition">Remove</button>
                </div>`;
        });
    } catch (err) { console.error(err); }
}

// ৬. প্রোডাক্ট ও ব্যানার ডিলিট এবং স্টক আপডেট ফাংশন
async function deleteProduct(id) {
    if (confirm("Are you sure?")) {
        await fetch(`${BASE_URL}/admin/delete-product/${id}`, { method: 'DELETE' });
        loadAdminProducts();
    }
}

async function toggleStock(id) {
    await fetch(`${BASE_URL}/admin/toggle-stock/${id}`, { method: 'PATCH' });
    loadAdminProducts();
}

async function deleteBanner(id) {
    if (confirm("Remove this Banner?")) {
        await fetch(`${BASE_URL}/admin/delete-banner/${id}`, { method: 'DELETE' });
        loadAdminBanners();
    }
}
