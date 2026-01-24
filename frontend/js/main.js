const BASE_URL = 'https://website-production-f869.up.railway.app';
const API_URL = `${BASE_URL}/products`;
const WHATSAPP_NUMBER = '8801847853867'; 
let allProducts = [];
let cart = []; 
let currentSlide = 0; // স্লাইডার ভেরিয়েবল
let banners = [];     // স্লাইডার ভেরিয়েবল

// ১. প্রোফাইল ও ইউজার হ্যান্ডেলার (LocalStorage থেকে ডাটা রিড করা)
const userName = localStorage.getItem('userName');
const userEmail = localStorage.getItem('userEmail');
const authNav = document.getElementById('auth-nav');

if (userName && authNav) {
    authNav.innerHTML = `
        <div class="relative">
            <button onclick="toggleProfile()" class="flex flex-col items-end group">
                <span class="text-[9px] text-rose-500 uppercase font-black leading-none mb-1 tracking-tighter">Your Profile</span>
                <div class="flex items-center gap-2 group-hover:text-rose-500 transition">
                    <span class="text-[13px] font-bold text-white">${userName}</span>
                    <i class="fas fa-user-circle text-xl"></i>
                </div>
            </button>
            <div id="profile-card" class="profile-dropdown">
                <div class="text-center border-b border-white/5 pb-3 mb-3">
                    <p class="text-xs font-bold text-white">${userName}</p>
                    <p class="text-[9px] text-gray-500 truncate">${userEmail}</p>
                </div>
                <div class="flex flex-col gap-2">
                    <a href="profile.html" class="text-[10px] hover:text-rose-500 transition"><i class="fas fa-user mr-2"></i> Dashboard</a>
                    <button onclick="handleLogout()" class="text-[10px] text-left text-red-500 hover:text-red-400 transition"><i class="fas fa-sign-out-alt mr-2"></i> Logout</button>
                </div>
            </div>
        </div>`;
}

function toggleProfile() {
    const card = document.getElementById('profile-card');
    if(card) card.classList.toggle('active');
}

function handleLogout() {
    if(confirm("Are you sure you want to logout?")) {
        localStorage.clear();
        window.location.reload();
    }
}

// ২. ডাইনামিক ব্যানার ফেচ লজিক (Updated endpoint to /sliders)
async function fetchBanners() {
    try {
        // কনসোলে 404 আসছিল কারণ এন্ডপয়েন্ট ভুল ছিল, এখন /sliders ব্যবহার করা হয়েছে
        const res = await fetch(`${BASE_URL}/sliders`); 
        banners = await res.json();
        const slider = document.getElementById('slider');
        
        if (slider && banners.length > 0) {
            slider.innerHTML = banners.map(b => `
                <div class="min-w-full h-full relative">
                    <img src="${b.image}" class="w-full h-full object-cover">
                    ${b.link ? `<a href="${b.link}" class="absolute inset-0"></a>` : ''}
                </div>
            `).join('');
            
            // অটো স্লাইড চালু করা
            setInterval(nextSlide, 5000);
        }
    } catch (err) { console.error("Error fetching banners:", err); }
}

// ৩. কার্ট ও ডাটাবেজ চেকআউট লজিক (আপডেটেড)
function toggleCart() {
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');
    if(sidebar && overlay) {
        sidebar.classList.toggle('translate-x-full');
        overlay.classList.toggle('hidden');
    }
}

function addToCart(productId) {
    const product = allProducts.find(p => p._id === productId);
    if (product && product.inStock !== false) {
        cart.push(product);
        updateCartUI();
        const sidebar = document.getElementById('cart-sidebar');
        if(sidebar && sidebar.classList.contains('translate-x-full')) toggleCart();
    } else {
        alert("This product is currently out of stock!");
    }
}

function updateCartUI() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalLabel = document.getElementById('cart-total');
    const cartCountBtn = document.getElementById('cart-count-btn');
    if(!cartItemsContainer) return;

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
    if(cartTotalLabel) cartTotalLabel.innerText = `৳${total}`;
    if(cartCountBtn) cartCountBtn.innerText = `৳${total}`;
}

function removeFromCart(index) { cart.splice(index, 1); updateCartUI(); }

async function checkout() {
    if (!userName) {
        alert("Please login first to place an order!");
        window.location.href = 'login.html';
        return;
    }

    if (cart.length === 0) return alert("Your cart is empty!");

    const totalAmount = cart.reduce((sum, item) => sum + item.price, 0);

    const orderData = {
        userName,
        userEmail,
        products: cart,
        totalAmount
    };

    try {
        const res = await fetch(`${BASE_URL}/admin/place-order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        if (res.ok) {
            let message = `*--- NEW ORDER (Turjo Site) ---*\n👤 *Customer:* ${userName}\n📧 *Email:* ${userEmail}\n\n📦 *Items:* \n`;
            cart.forEach((item, i) => { message += `${i + 1}. ${item.name} - ৳${item.price}\n`; });
            message += `\n💰 *Total Amount:* ৳${totalAmount}\n\n_I have placed my order on the website._`;
            
            window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
            
            alert("Order saved and redirecting to WhatsApp!");
            cart = [];
            updateCartUI();
            toggleCart();
        } else {
            alert("Failed to save order!");
        }
    } catch (err) {
        console.error("Order processing error:", err);
        alert("Server error!");
    }
}

// ৪. স্লাইডার কন্ট্রোল
function nextSlide() {
    const slider = document.getElementById('slider');
    if (!slider || banners.length === 0) return;
    currentSlide = (currentSlide + 1) % banners.length;
    slider.style.transform = `translateX(-${currentSlide * 100}%)`;
}

function prevSlide() {
    const slider = document.getElementById('slider');
    if (!slider || banners.length === 0) return;
    currentSlide = (currentSlide - 1 + banners.length) % banners.length;
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
    if(!container) return;
    container.innerHTML = '';
    if(countLabel) countLabel.innerText = `${products.length} items available`;
    
    products.forEach(p => {
        const hasDiscount = p.oldPrice && p.oldPrice > p.price;
        const discountPercentage = hasDiscount ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100) : 0;

        const actionBtn = p.inStock !== false 
            ? `<button onclick="event.stopPropagation(); addToCart('${p._id}')" class="w-full bg-white/5 hover:bg-rose-600 text-[10px] font-bold py-2 rounded-lg transition-all border border-white/10 hover:border-rose-600 uppercase">Add to Cart</button>`
            : `<button class="w-full bg-gray-800 text-gray-500 text-[10px] font-bold py-2 rounded-lg border border-white/5 cursor-not-allowed uppercase" disabled>Out of Stock</button>`;

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
    const type = document.getElementById('sort-filter')?.value;
    let sorted = [...allProducts];
    if (type === 'low-high') sorted.sort((a,b) => a.price - b.price); 
    else if (type === 'high-low') sorted.sort((a,b) => b.price - a.price);
    displayProducts(sorted);
}

function searchProducts() {
    const term = document.getElementById('search-input')?.value.toLowerCase();
    if(term) displayProducts(allProducts.filter(p => p.name.toLowerCase().includes(term)));
}

// ইনিশিয়াল কল
fetchBanners();
fetchProducts();
