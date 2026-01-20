const BASE_URL = 'https://website-production-f869.up.railway.app';
let editingProductId = null; // বর্তমানে কোনো প্রোডাক্ট এডিট হচ্ছে কি না তা ট্র্যাক করার জন্য

// ১. ট্যাব সুইচিং লজিক
function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(tabId).classList.remove('hidden');
    document.getElementById('btn-' + tabId).classList.add('active');
}

// ২. স্ট্যাটাস মেসেজ দেখানোর ফাংশন (Alert-এর বদলে অন-স্ক্রিন মেসেজ)
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

// ৪. প্রোডাক্ট ম্যানেজমেন্ট (Add & Edit)
async function addProduct() {
    const name = document.getElementById('name').value;
    const price = document.getElementById('price').value;
    const oldPrice = document.getElementById('oldPrice').value; // ডিসকাউন্ট ফিল্ড
    const image = document.getElementById('imgUrl').value;

    if(!name || !price || !image) return showMsg('action-msg', 'Fill all fields!', true);

    const productData = { name, price, oldPrice, image };
    
    // যদি editingProductId থাকে তবে Update হবে (PUT), না থাকলে Add হবে (POST)
    const url = editingProductId ? `${BASE_URL}/admin/edit-product/${editingProductId}` : `${BASE_URL}/admin/add-product`;
    const method = editingProductId ? 'PUT' : 'POST';

    try {
        await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });
        
        showMsg('action-msg', editingProductId ? 'Product Updated!' : 'Product Published!');
        resetProductForm(); // ফর্ম রিসেট করা
        loadAdminProducts(); // লিস্ট রিফ্রেশ করা
    } catch (err) {
        showMsg('action-msg', 'Error processing request', true);
    }
}

// এডিট মোড শুরু করার ফাংশন
function startEdit(id, name, price, oldPrice, image) {
    editingProductId = id;
    document.getElementById('name').value = name;
    document.getElementById('price').value = price;
    document.getElementById('oldPrice').value = oldPrice || '';
    document.getElementById('imgUrl').value = image;
    
    // বাটনের টেক্সট পরিবর্তন করা
    document.getElementById('publish-btn').innerText = 'Update Product';
    showMsg('action-msg', 'Editing: ' + name);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // স্ক্রিন উপরে নিয়ে যাওয়া
}

// ফর্ম রিসেট ফাংশন
function resetProductForm() {
    editingProductId = null;
    document.getElementById('name').value = '';
    document.getElementById('price').value = '';
    document.getElementById('oldPrice').value = '';
    document.getElementById('imgUrl').value = '';
    document.getElementById('publish-btn').innerText = 'Publish Product';
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
                    <p class="text-[9px] text-rose-500 font-bold">৳${p.price} ${p.oldPrice ? `<span class="line-through text-gray-500 ml-1">৳${p.oldPrice}</span>` : ''}</p>
                </div>
            </div>
            <div class="flex gap-1">
                <button onclick="startEdit('${p._id}', '${p.name}', ${p.price}, ${p.oldPrice || 0}, '${p.image}')" class="text-yellow-500 hover:bg-yellow-500/10 p-2 rounded-lg transition"><i class="fas fa-edit text-[10px]"></i></button>
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
    document.getElementById('bannerUrl').value = '';
    document.getElementById('displayTime').value = '';
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

// ৬. ডিলিট ও স্টক আপডেট
async function deleteProduct(id) { if(confirm("Delete Product?")) { await fetch(`${BASE_URL}/admin/delete-product/${id}`, {method: 'DELETE'}); loadAdminProducts(); } }
async function toggleStock(id) { await fetch(`${BASE_URL}/admin/toggle-stock/${id}`, {method: 'PATCH'}); loadAdminProducts(); }
async function deleteBanner(id) { if(confirm("Remove Banner?")) { await fetch(`${BASE_URL}/admin/delete-banner/${id}`, {method: 'DELETE'}); loadAdminBanners(); } }
