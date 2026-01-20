const API_URL = 'https://website-production-f869.up.railway.app/products';
const WHATSAPP_NUMBER = '8801XXXXXXXXX'; // আপনার হোয়াটসঅ্যাপ নাম্বার দিন
let allProducts = [];

async function fetchProducts() {
    try {
        const res = await fetch(API_URL);
        allProducts = await res.json();
        displayProducts(allProducts);
    } catch (err) {
        console.error("Fetch Error:", err);
    }
}

function displayProducts(products) {
    const container = document.getElementById('products-container');
    container.innerHTML = ''; 

    if (products.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center py-20 opacity-40 text-xl">No products matched your search!</div>';
        return;
    }

    products.forEach(p => {
        const discount = p.customDiscount || (p.oldPrice ? `-${Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100)}%` : null);
        const waMessage = encodeURIComponent(`Hello Turjo Site,\nI want to buy: ${p.name}\nPrice: ৳${p.price}`);
        const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${waMessage}`;

        container.innerHTML += `
            <div class="glass-card rounded-[2rem] p-6 flex flex-col group relative overflow-hidden dark:bg-white/5 dark:border-white/5 light:bg-white light:shadow-xl light:border-gray-100 border">
                ${discount ? `<div class="absolute top-5 left-5 z-10 btn-primary text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg shadow-rose-500/20">${discount}</div>` : ''}
                
                <div class="w-full aspect-square bg-gray-500/5 rounded-[1.5rem] flex items-center justify-center mb-6 overflow-hidden relative">
                    <img src="${p.image}" class="w-2/3 h-2/3 object-contain group-hover:scale-125 transition duration-700 pointer-events-none" alt="${p.name}">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition duration-500"></div>
                </div>

                <h3 class="font-bold text-lg mb-2 truncate dark:text-white light:text-gray-900">${p.name}</h3>
                <p class="text-xs mb-6 dark:text-gray-500 light:text-gray-600 line-clamp-2 leading-relaxed min-h-[2.5rem]">${p.description || 'Premium hand-picked digital service'}</p>
                
                <div class="flex items-center justify-between mt-auto">
                    <div>
                        <span class="text-2xl font-extrabold dark:text-white light:text-rose-600">৳${p.price}</span>
                        ${p.oldPrice ? `<span class="block text-xs dark:text-gray-600 light:text-gray-400 line-through italic font-medium">৳${p.oldPrice}</span>` : ''}
                    </div>
                    <a href="${waLink}" target="_blank" class="w-12 h-12 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg shadow-rose-500/5">
                        <i class="fab fa-whatsapp text-xl"></i>
                    </a>
                </div>
            </div>`;
    });
}

function searchProducts() {
    const term = document.getElementById('search-input').value.toLowerCase();
    const filtered = allProducts.filter(p => p.name.toLowerCase().includes(term) || (p.description && p.description.toLowerCase().includes(term)));
    displayProducts(filtered);
}

fetchProducts();
