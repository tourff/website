const BASE_URL = 'https://website-production-f869.up.railway.app';
const params = new URLSearchParams(window.location.search);
const productId = params.get('id');

let currentProduct = null;
let quantity = 1;

// ১. ট্যাব সুইচিং লজিক
function switchTab(tab) {
    const descContent = document.getElementById('p-desc-content');
    const revContent = document.getElementById('p-rev-content');
    const descBtn = document.getElementById('tab-desc-btn');
    const revBtn = document.getElementById('tab-rev-btn');

    if (tab === 'desc') {
        descContent.classList.remove('hidden');
        revContent.classList.add('hidden');
        descBtn.classList.add('active-tab');
        revBtn.classList.remove('active-tab');
        revBtn.classList.add('text-gray-500');
    } else {
        descContent.classList.add('hidden');
        revContent.classList.remove('hidden');
        revBtn.classList.add('active-tab');
        descBtn.classList.remove('active-tab');
        descBtn.classList.add('text-gray-500');
        loadReviews();
    }
}

// ২. কোয়ান্টিটি লজিক
function updateQuantity(amount) {
    if (quantity + amount >= 1) {
        quantity += amount;
        document.getElementById('qty-value').innerText = quantity;
    }
}

// ৩. স্টার জেনারেটর লজিক
function generateStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= Math.floor(rating)) stars += '<i class="fas fa-star text-yellow-500"></i>';
        else stars += '<i class="far fa-star text-gray-600"></i>';
    }
    return stars;
}

// ৪. মেইন লোডার লজিক (ফিক্সড ডেসক্রিপশন লজিক)
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

            // --- ডেসক্রিপশন ফিক্স ---
            // ডাটাবেজে ডেসক্রিপশন থাকলে সেটি দেখাবে, না থাকলে ডিফল্ট লেখা দেখাবে
            document.getElementById('p-desc-content').innerText = currentProduct.description && currentProduct.description.trim() !== "" 
                ? currentProduct.description 
                : "Premium service with instant delivery and priority support.";
            // ---------------------

            document.getElementById('p-sold').innerText = `${currentProduct.soldCount || 0}+`;
            document.getElementById('p-rating-stat').innerText = currentProduct.ratings || "5.0";
            document.getElementById('p-stars').innerHTML = generateStars(currentProduct.ratings || 5);
            document.getElementById('p-review-count').innerText = `(${currentProduct.reviews || 0} reviews)`;
            document.getElementById('p-review-count-tab').innerText = currentProduct.reviews || 0;
            document.getElementById('p-stock').innerHTML = `<span class="w-2 h-2 bg-green-500 rounded-full animate-ping"></span> In Stock (${currentProduct.stockQuantity || 0} available)`;

            // রিলেটেড প্রোডাক্ট লোড
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

// ৫. রিভিউ লজিক (Mockup)
function loadReviews() {
    const reviewsList = document.getElementById('reviews-list');
    if (currentProduct && currentProduct.reviews > 0) {
        reviewsList.innerHTML = `
            <div class="bg-white/5 p-5 rounded-2xl border border-white/5 mb-4">
                <div class="flex justify-between items-start mb-3">
                    <div>
                        <p class="text-xs font-bold text-white">Siyam Ahmed</p>
                        <div class="flex gap-1 text-[8px] text-yellow-500 mt-1">${generateStars(5)}</div>
                    </div>
                    <span class="text-[9px] text-gray-600">2 days ago</span>
                </div>
                <p class="text-[11px] text-gray-400 italic">"Excellent service! Fast delivery via WhatsApp. Recommended!"</p>
            </div>`;
    }
}

// ৬. হোয়াটসঅ্যাপ অর্ডার লজিক
function buyViaWhatsApp() {
    const total = currentProduct.price * quantity;
    const msg = `*--- NEW ORDER ---*\n📦 *Product:* ${currentProduct.name}\n🔢 *Quantity:* ${quantity}\n💰 *Total:* ৳${total}\n\n_I want to purchase this item!_`;
    window.open(`https://wa.me/8801XXXXXXXXX?text=${encodeURIComponent(msg)}`, '_blank');
}

function handleAddToCart() {
    alert(`${quantity} unit(s) of ${currentProduct.name} added to cart!`);
}

// মেইন ফাংশন কল
loadProductDetails();
