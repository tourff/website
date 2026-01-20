const API_URL = 'https://website-production-f869.up.railway.app/products';
let allProducts = [];

// ১. ইউজার স্ট্যাটাস হ্যান্ডেল করা
const user = localStorage.getItem('user');
if (user) {
    document.getElementById('nav-auth-section').innerHTML = `
        <button onclick="logout()" class="flex items-center gap-2 text-rose-500 font-bold uppercase text-[12px]">
            <i class="fas fa-user-circle"></i> ${user}
        </button>`;
}

function logout() { localStorage.removeItem('user'); location.reload(); }

// ২. প্রোডাক্ট ফেচ করা
fetch(API_URL).then(res => res.json()).then(data => {
    allProducts = data;
    displayProducts(allProducts);
});

function displayProducts(products) {
    const container = document.getElementById('products-container');
    const countText = document.getElementById('product-count');
    
    container.innerHTML = '';
    countText.innerText = `${products.length} items`;

    products.forEach(p => {
        const discount = p.customDiscount || (p.oldPrice ? `-${Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100)}%` : null);
        
        container.innerHTML += `
            <div class="product-card flex flex-col group relative">
                <div class="relative bg-gradient-to-br from-rose-900/20 to-transparent p-10 aspect-square flex items-center justify-center overflow-hidden">
                    ${discount ? `<div class="absolute top-3 left-3 z-10 badge-discount">${discount}</div>` : ''}
                    <div class="absolute top-3 right-3 text-gray-500 text-xs"><i class="far fa-heart"></i></div>
                    
                    <img src="${p.image}" class="w-4/5 h-4/5 object-contain z-10 transition duration-500 group-hover:scale-110" alt="${p.name}">
                    
                    <div class="absolute inset-4 bg-white/5 rounded-2xl border border-white/5 pointer-events-none"></div>
                </div>

                <div class="p-4 bg-[#1a1426]">
                    <h3 class="text-xs font-medium text-gray-300 mb-1 truncate">${p.name}</h3>
                    <div class="flex items-center gap-2">
                        <span class="text-rose-500 font-bold">৳${p.price}</span>
                        ${p.oldPrice ? `<span class="text-[10px] text-gray-500 line-through">৳${p.oldPrice}</span>` : ''}
                    </div>
                </div>
            </div>`;
    });
}

// ৩. সার্চ লজিক
function searchProducts() {
    const term = document.getElementById('search-input').value.toLowerCase();
    displayProducts(allProducts.filter(p => p.name.toLowerCase().includes(term)));
}
