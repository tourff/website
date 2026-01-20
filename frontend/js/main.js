const API_URL = 'https://website-production-f869.up.railway.app/products';
const WHATSAPP_NUMBER = '8801XXXXXXXXX'; // আপনার হোয়াটসঅ্যাপ নাম্বার দিন (যেমন: 8801700000000)
let allProducts = [];

// --- ১. ইউজার লগইন স্ট্যাটাস চেক ---
const user = localStorage.getItem('user');
const navAuthContainer = document.querySelector('nav .flex.items-center.gap-4');

if (user) {
    // লগইন থাকলে ইউজারের নাম এবং লগআউট বাটন দেখাবে
    navAuthContainer.insertAdjacentHTML('afterbegin', `
        <div class="flex flex-col items-end mr-2 md:mr-4">
            <span class="text-[8px] md:text-[10px] text-gray-500 uppercase tracking-widest">Premium Member</span>
            <span class="text-xs md:text-sm font-bold text-rose-500">${user}</span>
        </div>
        <button onclick="logoutUser()" class="text-[9px] md:text-[10px] text-gray-400 hover:text-white transition mr-2 uppercase font-bold tracking-tighter">
            <i class="fas fa-sign-out-alt"></i>
        </button>
    `);
} else {
    // লগইন না থাকলে লগইন লিঙ্ক দেখাবে
    navAuthContainer.insertAdjacentHTML('afterbegin', `
        <a href="login.html" class="text-xs font-bold text-gray-500 hover:text-rose-500 transition mr-4 uppercase tracking-widest">
            Login
        </a>
    `);
}

// লগআউট ফাংশন
function logoutUser() {
    localStorage.clear();
    location.reload();
}

// --- ২. প্রোডাক্ট ডাটা ফেচ করা ---
async function fetchProducts() {
    try {
        const res = await fetch(API_URL);
        allProducts = await res.json();
        displayProducts(allProducts);
    } catch (err) {
        console.error("Error fetching products:", err);
        const container = document.getElementById('products-container');
        container.innerHTML = '<p class="col-span-full text-center text-rose-500">Backend connection failed! Please check Railway.</p>';
    }
}

// --- ৩. প্রোডাক্ট ডিসপ্লে করা ---
function displayProducts(products) {
    const container = document.getElementById('products-container');
    container.innerHTML = ''; 

    if (products.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center py-20 opacity-40 text-xl font-bold italic tracking-tighter">No products matched your search!</div>';
        return;
    }

    products.forEach(p => {
        const discount = p.customDiscount || (p.oldPrice ? `-${Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100)}%` : null);
        const waMessage = encodeURIComponent(`Hello Turjo Site,\nI want to buy: ${p.name}\nPrice: ৳${p.price}`);
        const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${waMessage}`;

        container.innerHTML += `
            <div class="rounded-[2.5rem] p-6 flex flex-col group relative overflow-hidden transition-all duration-500 dark:bg-white/5 dark:border-white/5 light:bg-white light:shadow-2xl light:border-gray-100 border hover:border-rose-500/30">
                ${discount ? `<div class="absolute top-5 left-5 z-10 btn-primary text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg shadow-rose-500/30">${discount}</div>` : ''}
                
                <div class="w-full aspect-square bg-gray-500/5 rounded-[2rem] flex items-center justify-center mb-6 overflow-hidden relative">
                    <img src="${p.image}" class="w-2/3 h-2/3 object-contain group-hover:scale-125 transition duration-700" alt="${p.name}">
                </div>

                <h3 class="font-bold text-lg mb-2 truncate dark:text-white light:text-gray-900">${p.name}</h3>
                <p class="text-xs mb-6 dark:text-gray-500 light:text-gray-600 line-clamp-2 leading-relaxed min-h-[2.5rem]">${p.description || 'Premium hand-picked digital service'}</p>
                
                <div class="flex items-center justify-between mt-auto">
                    <div>
                        <span class="text-2xl font-black dark:text-white light:text-rose-600">৳${p.price}</span>
                        ${p.oldPrice ? `<span class="block text-xs dark:text-gray-600 light:text-gray-400 line-through italic">৳${p.oldPrice}</span>` : ''}
                    </div>
                    <a href="${waLink}" target="_blank" class="w-12 h-12 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg shadow-rose-500/5">
                        <i class="fab fa-whatsapp text-xl"></i>
                    </a>
                </div>
            </div>`;
    });
}

// --- ৪. লাইভ সার্চ লজিক ---
function searchProducts() {
    const term = document.getElementById('search-input').value.toLowerCase();
    const filtered = allProducts.filter(p => 
        p.name.toLowerCase().includes(term) || 
        (p.description && p.description.toLowerCase().includes(term))
    );
    displayProducts(filtered);
}

// সাইট লোড হলে প্রোডাক্ট কল করা
fetchProducts();
