const BASE_URL = 'https://website-production-f869.up.railway.app';

// ১. ট্যাব সুইচিং লজিক
function switchTab(tab) {
    const addSection = document.getElementById('section-add');
    const deleteSection = document.getElementById('section-delete');
    const addBtn = document.getElementById('tab-add');
    const deleteBtn = document.getElementById('tab-delete');

    if (tab === 'add') {
        addSection.style.display = 'block';
        deleteSection.style.display = 'none';
        addBtn.classList.add('tab-active');
        addBtn.classList.remove('text-gray-500');
        deleteBtn.classList.remove('tab-active');
        deleteBtn.classList.add('text-gray-500');
    } else {
        addSection.style.display = 'none';
        deleteSection.style.display = 'block';
        deleteBtn.classList.add('tab-active');
        deleteBtn.classList.remove('text-gray-500');
        addBtn.classList.remove('tab-active');
        addBtn.classList.add('text-gray-500');
        loadProducts(); // ডিলিট ট্যাবে গেলে লিস্ট রিফ্রেশ হবে
    }
}

// ২. লগইন ফাংশন
function login() {
    const pass = document.getElementById('password').value;
    if (pass === 'admin123') {
        document.getElementById('login-box').style.display = 'none';
        document.getElementById('panel').style.display = 'block';
        loadProducts();
    } else {
        alert("Access Denied! Wrong Password.");
    }
}

// ৩. প্রোডাক্ট লোড করা
async function loadProducts() {
    const res = await fetch(`${BASE_URL}/products`);
    const products = await res.json();
    const list = document.getElementById('manage-list');
    list.innerHTML = products.length === 0 ? '<p class="text-center opacity-40 py-10">No products available.</p>' : '';

    products.forEach(p => {
        list.innerHTML += `
            <div class="flex items-center justify-between bg-white/5 border border-white/5 p-4 rounded-2xl hover:border-rose-500/30 transition">
                <div class="flex items-center gap-4">
                    <img src="${p.image}" class="w-12 h-12 object-contain bg-black rounded-xl">
                    <div>
                        <p class="font-bold text-sm text-white">${p.name}</p>
                        <p class="text-xs text-rose-500 font-bold">৳${p.price}</p>
                    </div>
                </div>
                <button onclick="deleteProduct('${p._id}')" class="w-10 h-10 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition">
                    <i class="fas fa-trash-alt text-xs"></i>
                </button>
            </div>`;
    });
}

// ৪. প্রোডাক্ট ডিলিট করা
async function deleteProduct(id) {
    if (!confirm("Are you sure? This action cannot be undone.")) return;
    try {
        await fetch(`${BASE_URL}/admin/delete-product/${id}`, { method: 'DELETE' });
        loadProducts(); // ডিলিট হওয়ার পর লিস্ট আপডেট
    } catch (err) {
        alert("Error deleting product.");
    }
}

// ৫. প্রোডাক্ট অ্যাড করা
async function add() {
    const data = {
        name: document.getElementById('name').value,
        price: document.getElementById('price').value,
        oldPrice: document.getElementById('oldPrice').value,
        customDiscount: document.getElementById('customDiscount').value,
        description: document.getElementById('description').value,
        image: document.getElementById('imgUrl').value
    };

    if (!data.name || !data.price || !data.image) return alert("Fill mandatory fields!");

    const res = await fetch(`${BASE_URL}/admin/add-product`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if (res.ok) {
        alert("Product Published Successfully!");
        location.reload();
    }
}
