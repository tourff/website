const API_URL = 'https://website-production-f869.up.railway.app/products';

fetch(API_URL)
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById('products-container');
    container.innerHTML = ''; 

    data.forEach(p => {
      // কাস্টম ডিসকাউন্ট থাকলে সেটি দেখাবে, না থাকলে অটোমেটিক ক্যালকুলেট করবে
      const discountText = p.customDiscount || (p.oldPrice ? `-${Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100)}%` : null);

      container.innerHTML += `
        <div class="glass-card rounded-2xl p-4 flex flex-col relative group">
            ${discountText ? `<div class="absolute top-3 left-3 bg-red-500/20 text-red-500 text-[10px] font-black px-2 py-0.5 rounded-md">${discountText}</div>` : ''}
            
            <div class="w-full aspect-square flex items-center justify-center mb-5 bg-[#0f121a] rounded-xl overflow-hidden">
                <img src="${p.image}" class="w-3/4 h-3/4 object-contain" alt="${p.name}">
            </div>

            <h3 class="text-xs font-semibold text-gray-300 mb-1 truncate">${p.name}</h3>
            <p class="text-[10px] text-gray-500 mb-4 line-clamp-2">${p.description || 'Premium Digital Service'}</p>
            
            <div class="mt-auto flex justify-between items-end">
                <div>
                    <span class="block text-pink-500 font-black text-xl leading-none">৳${p.price}</span>
                    ${p.oldPrice ? `<span class="text-[10px] text-gray-600 line-through italic">৳${p.oldPrice}</span>` : ''}
                </div>
                <button class="bg-[#1e293b] hover:bg-pink-600 p-2 rounded-lg text-white">
                    <i class="fas fa-shopping-cart text-xs"></i>
                </button>
            </div>
        </div>`;
    });
  });
