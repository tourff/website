const API_URL = 'https://website-production-f869.up.railway.app';
let allProducts = [];
let cart = [];

// ১. কার্ট ও সাইডবার লজিক
function toggleCart() {
    document.getElementById('cart-sidebar').classList.toggle('translate-x-full');
    document.getElementById('cart-overlay').classList.toggle('hidden');
}

function addToCart(id) {
    const p = allProducts.find(item => item._id === id);
    if(p) {
        cart.push(p);
        updateCartUI();
        if(document.getElementById('cart-sidebar').classList.contains('translate-x-full')) toggleCart();
    }
}

function updateCartUI() {
    const cartItems = document.getElementById('cart-items');
    const total = cart.reduce((s, i) => s + i.price, 0);
    cartItems.innerHTML = cart.length === 0 ? '<p class="text-center text-xs text-gray-500 mt-10 uppercase">Cart Empty</p>' : '';
    cart.forEach((item, index) => {
        cartItems.innerHTML += `
            <div class="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5 mb-3">
                <img src="${item.image}" class="w-10 h-10 object-contain">
                <div class="flex-1"><p class="text-[10px] font-bold truncate uppercase w-32">${item.name}</p></div>
                <button onclick="removeFromCart(${index})" class="text-gray-500 hover:text-rose-500 transition"><i class="fas fa-trash-alt"></i></button>
            </div>`;
    });
    document.getElementById('cart-count-btn').innerText = `৳${total}`;
    document.getElementById('cart-total').innerText = `৳${total}`;
}

function removeFromCart(index) { cart.splice(index, 1); updateCartUI(); }

// ২. হোয়াটসঅ্যাপ অর্ডার
function checkout() {
    if (cart.length === 0) return alert("Empty Cart!");
    let msg = `*--- ORDER (TURJO SITE) ---*\n`;
    cart.forEach((i, idx) => msg += `${idx+1}. ${i.name} - ৳${i.price}\n`);
    msg += `\n*Total:* ৳${cart.reduce((s, i) => s + i.price, 0)}`;
    window.open(`https://wa.me/8801XXXXXXXXX?text=${encodeURIComponent(msg)}`, '_blank');
}

// ৩. প্রোডাক্ট ডিসপ্লে (ডিটেইলস পেজ লিঙ্কসহ)
async function fetchProducts() {
    try {
        const res = await fetch(`${API_URL}/products`);
        const products = await res.json();
        if (Array.isArray(products)) {
            allProducts = products;
            displayProducts(allProducts);
        }
    } catch (err) { console.error("API Error"); }
}

function displayProducts(products) {
    const container = document.getElementById('products-container');
    if(!container) return;
    container.innerHTML = '';
    products.forEach(p => {
        container.innerHTML += `
            <div onclick="window.location.href='product-details.html?id=${p._id}'" 
                 class="card-bg cursor-pointer p-4 rounded-3xl border border-transparent hover:border-rose-500 transition-all ${!p.inStock ? 'opacity-50 grayscale' : ''}">
                <div class="bg-white/5 p-6 rounded-2xl mb-4 flex items-center justify-center h-40">
                    <img src="${p.image}" class="max-h-full object-contain">
                </div>
                <h3 class="text-[11px] font-bold text-gray-400 truncate uppercase">${p.name}</h3>
                <p class="text-rose-500 font-black mb-3">৳${p.price}</p>
                ${p.inStock ? `<button onclick="event.stopPropagation(); addToCart('${p._id}')" class="w-full bg-white/5 py-2 rounded-lg text-[10px] font-bold uppercase hover:bg-rose-600 transition">Add to Cart</button>` : `<button class="w-full bg-gray-800 py-2 rounded-lg text-[10px] text-gray-500 font-bold uppercase" disabled>Out of Stock</button>`}
            </div>`;
    });
}
fetchProducts();
