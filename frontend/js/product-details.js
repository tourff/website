const BASE_URL = 'https://website-production-f869.up.railway.app';
const params = new URLSearchParams(window.location.search);
const productId = params.get('id');

let currentProduct = null;
let quantity = 1;

// ১. কোয়ান্টিটি আপডেট ফাংশন
function updateQuantity(amount) {
    if (quantity + amount >= 1) {
        quantity += amount;
        document.getElementById('qty-value').innerText = quantity;
    }
}

// ২. স্টার জেনারেটর
function generateStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) stars += '<i class="fas fa-star text-yellow-500"></i>';
        else stars += '<i class="far fa-star text-gray-600"></i>';
    }
    return stars;
}

// ৩. মেইন লোডার
async function loadProductDetails() {
    if (!productId) return window.location.href = 'index.html';

    try {
        const res = await fetch(`${BASE_URL}/products`);
        const products = await res.json();
        currentProduct = products.find(p => p._id === productId);

        if (currentProduct) {
            // UI আপডেট
            document.getElementById('p-name').innerText = currentProduct.name;
            document.getElementById('p-price').innerText = `৳${currentProduct.price}`;
            if(currentProduct.oldPrice) document.getElementById('p-old-price').innerText = `৳${currentProduct.oldPrice}`;
            
            document.getElementById('p-image').src = currentProduct.image;
            document.getElementById('p-desc').innerText = currentProduct.description || "Premium quality service with instant delivery guarantee.";
            document.getElementById('p-sold').innerText = `${currentProduct.soldCount || 0}+`;
            document.getElementById('p-rating-stat').innerText = currentProduct.ratings || "5.0";
            document.getElementById('p-stars').innerHTML = generateStars(currentProduct.ratings || 5);
            document.getElementById('p-review-count').innerText = `(${currentProduct.reviews || 0} reviews)`;
            document.getElementById('p-stock').innerHTML = `<span class="w-2 h-2 bg-green-500 rounded-full animate-ping"></span> In Stock (${currentProduct.stockQuantity || 0} available)`;

            // রিলেটেড প্রোডাক্ট
            const related = products.filter(p => p._id !== productId).slice(0, 5);
            displayRelated(related);
        }
    } catch (err) { console.error("Error loading product"); }
}

function displayRelated(products) {
    const container = document.getElementById('related-container');
    container.innerHTML = products.map(p => `
        <div onclick="window.location.href='product.html?id=${p._id}'" class="glass-card p-6 rounded-[2rem] cursor-pointer hover:border-rose-500/50 transition group">
            <div class="h-32 flex items-center justify-center mb-6">
                <img src="${p.image}" class="max-h-full object-contain group-hover:scale-110 transition duration-500">
            </div>
            <h3 class="text-[10px] font-black uppercase tracking-tight truncate text-gray-400 group-hover:text-white transition">${p.name}</h3>
            <p class="text-rose-500 font-black mt-1">৳${p.price}</p>
        </div>
    `).join('');
}

// ৪. অ্যাকশন হ্যান্ডেলার
function handleAddToCart() {
    alert(`${quantity} unit(s) of ${currentProduct.name} added to cart!`);
    // এখানে আপনার মেইন কার্ট লজিক কল করতে পারেন
}

function buyViaWhatsApp() {
    const total = currentProduct.price * quantity;
    const msg = `*--- NEW ORDER ---*\n📦 *Product:* ${currentProduct.name}\n🔢 *Quantity:* ${quantity}\n💰 *Total:* ৳${total}\n\n_I want to buy this!_`;
    window.open(`https://wa.me/8801XXXXXXXXX?text=${encodeURIComponent(msg)}`, '_blank');
}

loadProductDetails();
