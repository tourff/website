const API_URL = 'https://website-production-f869.up.railway.app/products';

fetch(API_URL)
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById('products-container');
    container.innerHTML = ''; 

    data.forEach(p => {
      // ডামি ডিসকাউন্ট ক্যালকুলেশন (ছবির মতো দেখাতে)
      const oldPrice = Math.round(p.price * 1.4);
      const discount = Math.round(((oldPrice - p.price) / oldPrice) * 100);

      container.innerHTML += `
        <div class="glass-card rounded-2xl p-4 flex flex-col relative group">
            <div class="absolute top-3 left-3 bg-red-500/20 text-red-500 text-[10px] font-black px-2 py-0.5 rounded-md">
                -${discount}%
            </div>
            
            <div class="absolute top-3 right-3 text-gray-600 hover:text-pink-500 transition cursor-pointer">
                <i class="far fa-heart text-sm"></i>
            </div>

            <div class="w-full aspect-square flex items-center justify-center mb-5 bg-[#0f121a] rounded-xl overflow-hidden">
                <img src="${p.image || 'https://via.placeholder.com/150'}" 
                     class="w-3/4 h-3/4 object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]" 
                     alt="${p.name}">
            </div>

            <h3 class="text-xs font-semibold text-gray-300 mb-1 truncate">${p.name}</h3>
            <p class="text-[10px] text-gray-600 mb-4">Instant Delivery</p>
            
            <div class="mt-auto flex justify-between items-end">
                <div>
                    <span class="block text-pink-500 font-black text-xl leading-none">৳${p.price}</span>
                    <span class="text-[10px] text-gray-600 line-through leading-none italic">৳${oldPrice}</span>
                </div>
                <button class="bg-[#1e293b] hover:bg-pink-600 p-2 rounded-lg transition text-white">
                    <i class="fas fa-shopping-cart text-xs"></i>
                </button>
            </div>
        </div>`;
    });
  })
  .catch(err => {
    console.error("Fetch Error:", err);
    document.getElementById('products-container').innerHTML = '<p class="col-span-full text-center text-red-500">Failed to connect to backend!</p>';
  });
