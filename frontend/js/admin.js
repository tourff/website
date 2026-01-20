const API_URL = 'https://website-production-f869.up.railway.app';

// ১. প্রোডাক্ট পাবলিশ করার লজিক
const productForm = document.getElementById('product-form');
if (productForm) {
    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const data = {
            name: document.getElementById('name').value,
            price: Number(document.getElementById('price').value),
            oldPrice: Number(document.getElementById('oldPrice').value) || 0,
            image: document.getElementById('image').value,
            description: document.getElementById('description').value,
            inStock: true
        };

        try {
            const res = await fetch(`${API_URL}/admin/add-product`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            if (res.ok) {
                alert("Success: Product is now live!");
                location.reload();
            } else {
                alert("Failed: Check your server logs.");
            }
        } catch (err) {
            console.error("Connection error:", err);
            alert("Error: Server not responding.");
        }
    });
}

// ২. প্রোডাক্ট লিস্ট লোড ও ডিসপ্লে (forEach Error ফিক্স)
async function loadAdminProducts() {
    try {
        const res = await fetch(`${API_URL}/products`);
        
        if (!res.ok) throw new Error("Server error " + res.status);
        
        const products = await res.json();
        const list = document.getElementById('admin-product-list');

        // চেক করা যে products একটি অ্যারে কি না
        if (Array.isArray(products) && list) {
            list.innerHTML = products.length === 0 ? '<p class="text-gray-600 text-center text-xs">No products in shop.</p>' : '';
            
            products.forEach(p => {
                list.innerHTML += `
                    <div class="glass-box p-4 flex items-center justify-between gap-4 transition hover:border-white/20">
                        <div class="flex items-center gap-4">
                            <img src="${p.image}" class="w-12 h-12 object-contain bg-white/5 rounded-lg">
                            <div>
                                <h4 class="text-xs font-bold text-gray-200 uppercase truncate w-32 md:w-56">${p.name}</h4>
                                <p class="text-rose-500 font-bold text-[10px]">৳${p.price}</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <button onclick="toggleStock('${p._id}')" 
                                    class="px-4 py-2 rounded-lg text-[9px] font-black uppercase transition ${p.inStock ? 'bg-green-600/10 text-green-500' : 'bg-gray-600/10 text-gray-500'}">
                                ${p.inStock ? 'Stock In' : 'Out'}
                            </button>
                            <button onclick="deleteProduct('${p._id}')" 
                                    class="p-3 bg-red-600/10 text-red-500 rounded-lg hover:bg-red-600 hover:text-white transition">
                                <i class="fas fa-trash-alt text-xs"></i>
                            </button>
                        </div>
                    </div>`;
            });
        }
    } catch (err) {
        console.error("Error loading products:", err);
        const list = document.getElementById('admin-product-list');
        if(list) list.innerHTML = '<p class="text-red-500 text-center text-[10px]">Database connection failed.</p>';
    }
}

// ৩. স্টক পরিবর্তন ফাংশন
window.toggleStock = async function(id) {
    try {
        await fetch(`${API_URL}/admin/toggle-stock/${id}`, { method: 'PATCH' });
        loadAdminProducts(); // পেজ রিলোড ছাড়া আপডেট
    } catch (err) { console.error("Stock update failed"); }
}

// ৪. ডিলিট ফাংশন
window.deleteProduct = async function(id) {
    if (confirm("Delete this product permanently?")) {
        try {
            const res = await fetch(`${API_URL}/admin/delete-product/${id}`, { method: 'DELETE' });
            if (res.ok) loadAdminProducts();
        } catch (err) { alert("Delete failed!"); }
    }
}

// ইনিশিয়াল লোড
loadAdminProducts();
