const BASE_URL = 'https://website-production-f869.up.railway.app';
const API_URL = `${BASE_URL}/products`;
const WHATSAPP_NUMBER = '8801XXXXXXXXX'; // আপনার হোয়াটসঅ্যাপ নাম্বারটি এখানে দিন
let allProducts = [];
let cart = []; 

// ১. প্রোফাইল ও ইউজার হ্যান্ডেলার
const user = localStorage.getItem('user');
const authNav = document.getElementById('auth-nav');

if (user) {
    authNav.innerHTML = `
        <div class="relative">
            <button onclick="toggleProfile()" class="flex flex-col items-end group">
                <span class="text-[9px] text-rose-500 uppercase font-black leading-none mb-1 tracking-tighter">Your Profile</span>
                <div class="flex items-center gap-2 group-hover:text-rose-500 transition">
                    <span class="text-[13px] font-bold text-white">${user}</span>
                    <i class="fas fa-user-circle text-xl"></i>
                </div>
            </button>
            <div id="profile-card" class="profile-dropdown">
                <div class="text-center border-b border-white/5 pb-3 mb-3">
                    <p class="text-xs font-bold text-white">${user}</p>
                </div>
                <div class="flex flex-col gap-2">
                    <a href="profile.html" class="text-[10px] hover:text-rose-500 transition"><i class="fas fa-user mr-2"></i> Dashboard</a>
                    <button onclick="logout()" class="text-[10px] text-left text-red-500 hover:text-red-400 transition"><i class="fas fa-sign-out-alt mr-2"></i> Logout</button>
                </div>
            </div>
        </div>`;
}

function toggleProfile() {
    const card = document.getElementById('profile-card');
    if(card) card.classList.toggle('active');
}

function logout() {
    localStorage.removeItem('user');
    window.location.reload();
}

// ২. ডাইনামিক ব্যানার ফেচ লজিক
async function fetchBanners() {
    try {
        const res = await fetch(`${BASE_URL}/banners`);
        const banners = await res.json();
        const slider = document.getElementById('slider');
        
        if (banners.length > 0) {
            slider.innerHTML = banners.map(b => `<img src="${b.imageUrl}" class="slider-img">`).join('');
            setInterval(nextSlide, banners[0].displayTime || 5000);
        }
    } catch (err) { console.error("Error fetching banners"); }
}

// ৩. কার্ট ও চেকআউট লজিক
function toggleCart() {
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');
    sidebar.classList.toggle('translate-x-full');
    overlay.classList.toggle('hidden');
}

function addToCart(productId) {
    const product = allProducts.find(p => p._id === productId);
    if (product && product.inStock !== false) {
        cart.push(product);
        updateCartUI();
        if(document.getElementById('cart-sidebar').classList.contains('translate-x-full')) toggleCart();
    } else {
        alert("This product is currently out of stock!");
    }
}

function updateCartUI() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalLabel = document.getElementById('cart-total');
    const cartCountBtn = document.getElementById('cart-count-btn');
    cartItemsContainer.innerHTML = cart.length === 0 ? `<p class="text-gray-500 text-center text-xs mt-10">Empty cart</p>` : '';
    let total = 0;
    cart.forEach((item, index) => {
        total += item.price;
        cartItemsContainer.innerHTML += `
            <div class="flex items-center gap-4 bg-[#1e162e] p-3 rounded-xl border border-white/5">
                <img src="${item.image}" class="w-12 h-12 object-contain bg-[#161021] rounded-lg">
                <div class="flex-1"><h4 class="text-[10px] font-bold text-gray-300 truncate w-32">${item.name}</h4><p class="text-rose-500 font-bold text-xs">৳${item.price}</p></div>
                <button onclick="removeFromCart(${index})" class="text-gray-600 hover:text-rose-500 transition"><i class="fas fa-trash-alt text-xs"></i></button>
            </div>`;
    });
    cartTotalLabel.innerText = `৳${total}`;
    cartCountBtn.innerText = `৳${total}`;
}

function removeFromCart(index) { cart.splice(index, 1); updateCartUI(); }

function checkout() {
    if (cart.length === 0) return alert("Your cart is empty!");
    let message = `*--- NEW ORDER (Turjo Site) ---*\n👤 *Customer:* ${user || 'Guest'}\n\n📦 *Items:* \n`;
    cart.forEach((item, i) => { message += `${i + 1}. ${item.name} - ৳${item.price}\n`; });
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    message += `\n💰 *Total Amount:* ৳${total}\n\n_Please process my order!_`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
}

// ৪. স্লাইডার কন্ট্রোল
let currentSlide = 0;
function nextSlide() {
    const slider = document.getElementById('slider');
    const slides = slider.querySelectorAll('img');
    if (slides.length === 0) return;
    currentSlide = (currentSlide + 1) % slides.length;
    slider.style.transform = `translateX(-${currentSlide * 100}%)`;
}

function prevSlide() {
    const slider = document.getElementById('slider');
    const slides = slider.querySelectorAll('img');
    if (slides.length === 0) return;
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    slider.style.transform = `translateX(-${currentSlide * 100}%)`;
}

// ৫. প্রোডাক্ট ডাটা ফেচ ও ডিসপ্লে
async function fetchProducts() {
    try {
        const res = await fetch(API_URL);
        allProducts = await res.json();
        displayProducts(allProducts);
    } catch (err) { console.error("Error fetching products"); }
}

function displayProducts(products) {
    const container = document.getElementById('products-container');
    const countLabel = document.getElementById('item-count');
    container.innerHTML = '';
    countLabel.innerText = `${products.length} items`;
    
    products.forEach(p => {
        // ডিসকাউন্ট পার্সেন্টেজ ক্যালকুলেশন
        const hasDiscount = p.oldPrice && p.oldPrice > p.price;
        const discountPercentage = hasDiscount ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100) : 0;

        const actionBtn = p.inStock !== false 
            ? `<button onclick="event.stopPropagation(); addToCart('${p._id}')" class="w-full bg-white/5 hover:bg-rose-600 text-[10px] font-bold py-2 rounded-lg transition-all border border-white/10 hover:border-rose-600 uppercase">Add to Cart</button>`
            : `<button class="w-full bg-gray-800 text-gray-500 text-[10px] font-bold py-2 rounded-lg border border-white/5 cursor-not-allowed uppercase" disabled>Out of Stock</button>`;

        // কার্ডে ক্লিক করলে product.html এ যাবে
        container.innerHTML += `
            <div onclick="window.location.href='product.html?id=${p._id}'" class="card-bg flex flex-col group rounded-[1.5rem] overflow-hidden transition-all duration-500 hover:border-rose-500 border border-transparent relative cursor-pointer">
                ${hasDiscount ? `<div class="absolute top-3 left-3 z-10 bg-rose-500 text-white text-[9px] font-black px-2 py-1 rounded shadow-lg">-${discountPercentage}% OFF</div>` : ''}
                <div class="relative bg-gradient-to-b from-[#3a1a2e] to-transparent p-10 md:p-12 aspect-square flex items-center justify-center">
                    <img src="${p.image}" class="w-full h-full object-contain z-10 group-hover:scale-110 transition duration-700">
                    <div class="absolute inset-5 bg-white/5 rounded-2xl border border-white/5 pointer-events-none"></div>
                </div>
                <div class="p-4 bg-[#130d1d] flex flex-col gap-3">
                    <div>
                        <h3 class="text-[11px] font-bold text-gray-400 mb-1 truncate">${p.name}</h3>
                        <div class="flex items-center gap-2">
                            <span class="text-rose-500 font-black text-sm">৳${p.price}</span>
                            ${hasDiscount ? `<span class="text-[10px] text-gray-600 line-through font-bold">৳${p.oldPrice}</span>` : ''}
                        </div>
                    </div>
                    ${actionBtn}
                </div>
            </div>`;
    });
}

// ফিল্টার ও সার্চ
function sortProducts() {
    const type = document.getElementById('sort-filter').value;
    let sorted = [...allProducts];
    if (type === 'low-high') sorted.sort((a,b) => a.price - b.price); else if (type === 'high-low') sorted.sort((a,b) => b.price - a.price);
    displayProducts(sorted);
}

function searchProducts() {
    const term = document.getElementById('search-input').value.toLowerCase();
    displayProducts(allProducts.filter(p => p.name.toLowerCase().includes(term)));
}

// ইনিশিয়াল কল
fetchBanners();
fetchProducts();
