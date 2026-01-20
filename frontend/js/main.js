const API_URL = 'https://website-production-f869.up.railway.app/products';
const WHATSAPP_NUMBER = '8801XXXXXXXXX'; // আপনার নাম্বার দিন
let allProducts = [];

fetch(API_URL)
  .then(res => res.json())
  .then(data => {
    allProducts = data;
    displayProducts(allProducts);
  });

function displayProducts(products) {
    const container = document.getElementById('products-container');
    container.innerHTML = products.length === 0 ? '<p class="col-span-full text-center opacity-50">No products found!</p>' : ''; 
    products.forEach(p => {
      const discount = p.customDiscount || (p.oldPrice ? `-${Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100)}%` : null);
      const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`I want to buy: ${p.name} for ৳${p.price}`)}`;
      container.innerHTML += `
        <div class="rounded-3xl p-5 flex flex-col group relative transition dark:bg-white/5 light:bg-white light:shadow-lg">
            ${discount ? `<div class="absolute top-4 left-4 z-10 btn-primary text-white text-[10px] font-bold px-3 py-1 rounded-full">${discount}</div>` : ''}
            <div class="w-full aspect-square bg-gray-500/5 rounded-2xl flex items-center justify-center mb-6 overflow-hidden">
                <img src="${p.image}" class="w-3/4 h-3/4 object-contain transition duration-500 group-hover:scale-110">
            </div>
            <h3 class="font-bold mb-1 truncate dark:text-white light:text-gray-900">${p.name}</h3>
            <p class="text-xs mb-6 dark:text-gray-500 light:text-gray-600 line-clamp-2">${p.description || 'Premium Service'}</p>
            <div class="flex items-center justify-between mt-auto">
                <div><span class="text-2xl font-black dark:text-white light:text-rose-600">৳${p.price}</span></div>
                <a href="${waLink}" target="_blank" class="w-10 h-10 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl flex items-center justify-center transition-all"><i class="fas fa-shopping-bag text-xs"></i></a>
            </div>
        </div>`;
    });
}

function searchProducts() {
    const term = document.getElementById('search-input').value.toLowerCase();
    displayProducts(allProducts.filter(p => p.name.toLowerCase().includes(term)));
}
