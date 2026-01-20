const BASE_URL = 'https://website-production-f869.up.railway.app';

// ১. ট্যাব সুইচিং লজিক
function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(tabId).classList.remove('hidden');
    document.getElementById('btn-' + tabId).classList.add('active');
}

// ২. স্ট্যাটাস মেসেজ দেখানোর ফাংশন
function showMsg(msgId, text, isError = false) {
    const el = document.getElementById(msgId);
    el.innerText = text;
    el.style.display = 'block';
    el.style.backgroundColor = isError ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)';
    el.style.color = isError ? '#ef4444' : '#22c55e';
    setTimeout(() => { el.style.display = 'none'; }, 3000);
}

// ৩. লগইন ফাংশন
function login() {
    const pass = document.getElementById('password').value;
    if (pass === 'admin123') {
        showMsg('login-msg', 'Login Successful!');
        setTimeout(() => {
            document.getElementById('login-section').style.display = 'none';
            document.getElementById('admin-section').style.display = 'block';
            loadAdminProducts();
            loadAdminBanners();
        }, 1000);
    } else {
        showMsg('login-msg', 'Incorrect Password!', true);
    }
}

// ৪. প্রোডাক্ট ম্যানেজমেন্ট
async function addProduct() {
    const name = document.getElementById('name').value;
    const price = document.getElementById('price').value;
    const image = document.getElementById('imgUrl').value;

    if(!name || !price || !image) return showMsg('action-msg', 'Fill all fields!', true);

    await fetch(`${BASE_URL}/admin/add-product`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, price, image })
    });
    showMsg('action-msg', 'Product Published!');
    loadAdminProducts();
}

async function loadAdminProducts() {
    const res = await fetch(`${BASE_URL}/products`);
    const products = await res.json();
    const list = document.getElementById('admin-product-list');
    list.innerHTML = products.map(p => `
        <div class="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5">
            <div class="flex items-center gap-3">
                <img src="${p.image}" class="w-8 h-8 object-contain">
                <div>
                    <p class="text-[11px] font-bold truncate w-24">${p.name}</p>
                    <p class="text-[9px] ${p.inStock ? 'text-green-500' : 'text-red-500'} uppercase font-black">${p.inStock ? 'In Stock' : 'Out of Stock'}</p>
                </div>
            </div>
            <div class="flex gap-2">
                <button onclick="toggleStock('${p._id}')" class="text-blue-500 hover:bg-blue-500/10 p-2 rounded-lg transition"><i class="fas fa-sync-alt text-[10px]"></i></button>
                <button onclick="deleteProduct('${p._id}')" class="text-rose-500 hover:bg-rose-500/10 p-2 rounded-lg transition"><i class="fas fa-trash-alt text-[10px]"></i></button>
            </div>
        </div>`).join('');
}

// ৫. ব্যানার ম্যানেজমেন্ট
async function addBanner() {
    const imageUrl = document.getElementById('bannerUrl').value;
    const displayTime = document.getElementById('displayTime').value;
    if(!imageUrl) return showMsg('action-msg', 'Banner URL required!', true);

    await fetch(`${BASE_URL}/admin/add-banner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl, displayTime })
    });
    showMsg('action-msg', 'Banner Saved!');
    loadAdminBanners();
}

async function loadAdminBanners() {
    const res = await fetch(`${BASE_URL}/banners`);
    const banners = await res.json();
    const list = document.getElementById('admin-banner-list');
    list.innerHTML = banners.map(b => `
        <div class="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5">
            <img src="${b.imageUrl}" class="h-10 w-20 object-cover rounded-lg">
            <button onclick="deleteBanner('${b._id}')" class="text-rose-500 hover:bg-rose-500/10 p-2 rounded-lg transition"><i class="fas fa-times text-xs"></i></button>
        </div>`).join('');
}

async function deleteProduct(id) { if(confirm("Delete Product?")) { await fetch(`${BASE_URL}/admin/delete-product/${id}`, {method: 'DELETE'}); loadAdminProducts(); } }
async function toggleStock(id) { await fetch(`${BASE_URL}/admin/toggle-stock/${id}`, {method: 'PATCH'}); loadAdminProducts(); }
async function deleteBanner(id) { if(confirm("Remove Banner?")) { await fetch(`${BASE_URL}/admin/delete-banner/${id}`, {method: 'DELETE'}); loadAdminBanners(); } }
