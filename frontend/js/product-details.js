const BASE_URL = 'https://website-production-f869.up.railway.app';
const params = new URLSearchParams(window.location.search);
const productId = params.get('id');

async function loadProductDetails() {
    if(!productId) return window.location.href = 'index.html';

    const res = await fetch(`${BASE_URL}/products`);
    const allProducts = await res.json();
    const product = allProducts.find(p => p._id === productId);

    if(product) {
        // UI আপডেট করা
        document.getElementById('p-name').innerText = product.name;
        document.getElementById('p-price').innerText = `৳${product.price}`;
        document.getElementById('p-image').src = product.image;
        document.getElementById('p-desc').innerText = product.description || "Premium service with instant delivery and priority support.";
        document.getElementById('p-sold').innerText = `${product.soldCount || 0}+`;
        document.getElementById('p-rating').innerText = product.ratings || "5.0";
        document.getElementById('p-review-count').innerText = `(${product.reviews || 0} reviews)`;
        document.getElementById('p-stock').innerText = `● In Stock (${product.stockQuantity || 0} available)`;

        // রিলেটেড প্রোডাক্ট লোড করা
        const related = allProducts.filter(p => p._id !== productId).slice(0, 5);
        displayRelated(related);
    }
}

function displayRelated(products) {
    const container = document.getElementById('related-container');
    container.innerHTML = products.map(p => `
        <div onclick="window.location.href='product.html?id=${p._id}'" class="glass-card p-4 rounded-3xl cursor-pointer hover:border-rose-500 transition">
            <img src="${p.image}" class="w-full h-24 object-contain mb-4">
            <h3 class="text-[10px] font-bold truncate">${p.name}</h3>
        </div>
    `).join('');
}

loadProductDetails();
