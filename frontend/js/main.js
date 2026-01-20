const API_URL = 'https://website-production-f869.up.railway.app/products';
let allProducts = [];

// ১. প্রোফাইল হ্যান্ডেলার (Far Right Position)
const user = localStorage.getItem('user');
const authNav = document.getElementById('auth-nav');

if (user) {
    authNav.innerHTML = `
        <a href="profile.html" class="flex flex-col items-end group cursor-pointer">
            <span class="text-[9px] text-rose-500 uppercase font-black leading-none mb-1 tracking-tighter">Your Profile</span>
            <div class="flex items-center gap-2 group-hover:text-rose-500 transition">
                <span class="text-[13px] font-bold text-white">${user}</span>
                <i class="fas fa-user-circle text-xl"></i>
            </div>
        </a>
    `;
}

// ২. ব্যানার স্লাইডার লজিক
let currentSlide = 0;
const slider = document.getElementById('slider');
const slides = slider.querySelectorAll('img');

function showSlide(index) {
    if (index >= slides.length) currentSlide = 0;
    else if (index < 0) currentSlide = slides.length - 1;
    else currentSlide = index;
    slider.style.transform = `translateX(-${currentSlide * 100}%)`;
}
function nextSlide() { showSlide(currentSlide + 1); }
function prevSlide() { showSlide(currentSlide - 1); }
setInterval(nextSlide, 5000); // অটো স্লাইড ৫ সেকেন্ড পর পর

// ৩. ডাটা লোড ও ডিসপ্লে
async function fetchProducts() {
    try {
        const res = await fetch(API_URL);
        allProducts = await res.json();
        displayProducts(allProducts);
    } catch (err) { console.error("API Connection Failed"); }
}

function displayProducts(products) {
    const container = document.getElementById('products-container');
    const countLabel = document.getElementById('item-count');
    container.innerHTML = '';
    countLabel.innerText = `${products.length} items`;

    products.forEach(p => {
        const discount = p.customDiscount || (p.oldPrice ? `-${Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100)}%` : null);
        container.innerHTML += `
            <div class="card-bg flex flex-col group rounded-[1.5rem] overflow-hidden transition-all duration-500 hover:border-rose-500 border border-transparent">
                <div class="relative bg-gradient-to-b from-[#3a1a2e] to-transparent p-12 aspect-square flex items-center justify-center">
                    ${discount ? `<div class="absolute top-3 left-3 z-10 badge-rose text-[9px] font-black px-2 py-1">${discount}</div>` : ''}
                    <div class="absolute top-3 right-3 text-gray-600 text-[10px]"><i class="fas fa-heart"></i> 1</div>
                    <img src="${p.image}" class="w-full h-full object-contain z-10 group-hover:scale-110 transition duration-700">
                    <div class="absolute inset-5 bg-white/5 rounded-2xl border border-white/5 pointer-events-none"></div>
                </div>
                <div class="p-4 bg-[#130d1d]">
                    <h3 class="text-[11px] font-bold text-gray-400 mb-1 truncate">${p.name}</h3>
                    <div class="flex items-center gap-2">
                        <span class="text-rose-500 font-black text-sm">৳${p.price}</span>
                        ${p.oldPrice ? `<span class="text-[10px] text-gray-600 line-through">৳${p.oldPrice}</span>` : ''}
                    </div>
                </div>
            </div>`;
    });
}

// ৪. ফিল্টার ও সার্চ লজিক
function sortProducts() {
    const type = document.getElementById('sort-filter').value;
    let sorted = [...allProducts];
    if (type === 'low-high') sorted.sort((a,b) => a.price - b.price);
    else if (type === 'high-low') sorted.sort((a,b) => b.price - a.price);
    displayProducts(sorted);
}

function searchProducts() {
    const term = document.getElementById('search-input').value.toLowerCase();
    displayProducts(allProducts.filter(p => p.name.toLowerCase().includes(term)));
}

fetchProducts();
