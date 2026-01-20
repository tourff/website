const API_URL = 'https://website-production-f869.up.railway.app';
let allProducts = [];

async function fetchProducts() {
    try {
        const res = await fetch(`${API_URL}/products`);
        const products = await res.json();
        if (Array.isArray(products)) {
            allProducts = products;
            displayProducts(allProducts);
        }
    } catch (err) { console.error("Home fetch failed."); }
}

function displayProducts(products) {
    const container = document.getElementById('products-container');
    if(!container) return;
    container.innerHTML = '';
    products.forEach(p => {
        container.innerHTML += `
            <div onclick="window.location.href='product-details.html?id=${p._id}'" 
                 class="card-bg cursor-pointer p-4 rounded-3xl transition hover:border-rose-500">
                <img src="${p.image}" class="w-full h-32 object-contain mb-4">
                <h3 class="text-[11px] font-bold text-gray-400 truncate uppercase">${p.name}</h3>
                <p class="text-rose-500 font-black">৳${p.price}</p>
                <button onclick="event.stopPropagation(); addToCart('${p._id}')" class="w-full mt-3 bg-white/5 py-2 rounded-lg text-[10px] font-bold uppercase hover:bg-rose-600 transition">Add to Cart</button>
            </div>`;
    });
}
fetchProducts();
