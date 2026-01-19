const API_URL = 'https://website-production-f869.up.railway.app/products';

fetch(API_URL)
  .then(res => res.json())
  .then(data => {
    const d = document.getElementById('products');
    d.innerHTML = ''; 

    data.forEach(p => {
      d.innerHTML += `
        <div class="product-card glass rounded-2xl p-4 flex flex-col transition-all duration-300">
            <div class="bg-gray-900/50 rounded-xl mb-4 overflow-hidden aspect-square flex items-center justify-center">
                <img src="${p.image || 'https://via.placeholder.com/150'}" class="w-full h-full object-contain p-4">
            </div>
            <h3 class="text-sm font-semibold text-white mb-2 truncate">${p.name}</h3>
            <div class="flex justify-between items-end mt-auto">
                <div>
                    <p class="text-pink-500 font-black text-xl">৳${p.price}</p>
                    <p class="text-gray-500 text-[10px] line-through">৳${Math.round(p.price * 1.3)}</p>
                </div>
                <button class="bg-violet-600 p-2 rounded-lg hover:bg-pink-500 transition">
                    <i class="fas fa-plus text-xs text-white"></i>
                </button>
            </div>
        </div>`;
    });
  });
