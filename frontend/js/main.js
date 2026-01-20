const API_URL = 'https://website-production-f869.up.railway.app/products';
let allProducts = [];

// ১. প্রোফাইল হ্যান্ডেলার
const user = localStorage.getItem('user');
const authNav = document.getElementById('auth-nav');

if (user) {
    // লগইন থাকলে "Your Profile" দেখাবে এবং প্রোফাইল পেজে লিঙ্ক করবে
    authNav.innerHTML = `
        <a href="profile.html" class="flex flex-col items-end group">
            <span class="text-[9px] text-rose-500 uppercase tracking-tighter font-bold leading-none mb-1">Your Profile</span>
            <div class="flex items-center gap-2 group-hover:text-rose-500 transition">
                <span class="text-[13px] font-bold text-white">${user}</span>
                <i class="fas fa-user-circle text-lg"></i>
            </div>
        </a>
    `;
}

// ২. প্রোডাক্ট ডাটা ফেচ করা
fetch(API_URL).then(res => res.json()).then(data => {
    allProducts = data;
    displayProducts(allProducts);
});

// ৩. প্রোডাক্ট ডিসপ্লে লজিক
function displayProducts(products) {
    const container = document.getElementById('products-container');
    const countLabel = document.getElementById('item-count');
    
    container.innerHTML = '';
    countLabel.innerText = `${products.length} items`; // আইটেম সংখ্যা আপডেট

    products.forEach(p => {
        const discount = p.customDiscount || (p.oldPrice ? `-${Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100)}%` : null);
        
        container.innerHTML += `
            <div class="card-bg flex flex-col group rounded-xl overflow-hidden transition hover:border-rose-500">
                <div class="relative bg-gradient-to-b from-[#3a1a2e] to-transparent p-12 aspect-square flex items-center justify-center">
                    ${discount ? `<div class="absolute top-2.5 left-2.5 z-10 badge-rose text-[9px] font-bold px-1.5 py-0.5">${discount}</div>` : ''}
                    <div class="absolute top-2.5 right-2.5 text-gray-600 text-[10px] flex items-center gap-1"><i class="fas fa-heart"></i> 1</div>
                    
                    <img src="${p.image}" class="w-full h-full object-contain z-10 group-hover:scale-110 transition duration-500">
                    
                    <div class="absolute inset-5 bg-white/5 rounded-2xl border border-white/5 pointer-events-none"></div>
                </div>

                <div class="p-3 bg-[#130d1d]">
                    <h3 class="text-[11px] font-medium text-gray-400 mb-1 truncate">${p.name}</h3>
                    <div class="flex items-center gap-2">
                        <span class="text-purple-500 font-bold text-sm">৳${p.price}</span>
                        ${p.oldPrice ? `<span class="text-[9px] text-gray-600 line-through">৳${p.oldPrice}</span>` : ''}
                    </div>
                </div>
            </div>`;
    });
}

// ৪. সার্চ ফাংশন
function searchProducts() {
    const term = document.getElementById('search-input').value.toLowerCase();
    displayProducts(allProducts.filter(p => p.name.toLowerCase().includes(term)));
}
