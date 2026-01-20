const API_URL = 'https://website-production-f869.up.railway.app/products';
let allProducts = [];

// ইউজার চেক
const user = localStorage.getItem('user');
if (user) {
    document.getElementById('auth-nav').innerHTML = `
        <button onclick="localStorage.clear(); location.reload();" class="text-rose-500 font-bold uppercase text-[10px]">
            <i class="fas fa-user-circle"></i> ${user}
        </button>`;
}

// প্রোডাক্ট ফেচ
fetch(API_URL).then(res => res.json()).then(data => {
    allProducts = data;
    displayProducts(allProducts);
});

function displayProducts(products) {
    const container = document.getElementById('products-container');
    const countLabel = document.getElementById('item-count');
    
    container.innerHTML = '';
    countLabel.innerText = `${products.length} items`;

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

function searchProducts() {
    const term = document.getElementById('search-input').value.toLowerCase();
    displayProducts(allProducts.filter(p => p.name.toLowerCase().includes(term)));
}
