const params = new URLSearchParams(window.location.search);
const productId = params.get('id');
const API_URL = 'https://website-production-f869.up.railway.app/products';
let currentProduct = null;

async function loadProductDetails() {
    try {
        const res = await fetch(API_URL);
        const allProducts = await res.json();
        currentProduct = allProducts.find(p => p._id === productId);

        if (currentProduct) {
            // ১. বেসিক ইনফো আপডেট
            document.getElementById('p-name').innerText = currentProduct.name;
            document.getElementById('bread-name').innerText = currentProduct.name;
            document.getElementById('p-price').innerText = `৳${currentProduct.price}`;
            document.getElementById('p-img').src = currentProduct.image;
            document.getElementById('p-desc').innerHTML = currentProduct.description || 
                `<p>${currentProduct.name} is a premium digital service provided by Turjo Site. It offers high-quality access and reliable performance for users in Bangladesh.</p>`;

            // ২. রিলেটেড প্রোডাক্টস লোড করা
            const related = allProducts.filter(p => p._id !== productId).slice(0, 5);
            const relatedGrid = document.getElementById('related-grid');
            related.forEach(rp => {
                relatedGrid.innerHTML += `
                    <div onclick="window.location.href='product-details.html?id=${rp._id}'" class="related-card cursor-pointer p-6 rounded-3xl flex flex-col group">
                        <div class="aspect-[3/4] flex items-center justify-center mb-4 relative">
                            <img src="${rp.image}" class="w-full h-full object-contain group-hover:scale-110 transition duration-500">
                            <div class="absolute inset-2 border border-white/5 bg-white/5 rounded-2xl pointer-events-none"></div>
                        </div>
                        <h4 class="text-[10px] font-bold text-gray-400 truncate tracking-tight uppercase">${rp.name}</h4>
                    </div>`;
            });
        }
    } catch (err) { console.error("Details Load Failed:", err); }
}

// হোয়াটসঅ্যাপ বাই বাটন লজিক
function buyViaWA() {
    if (!currentProduct) return;
    const message = `*--- NEW PRODUCT INQUIRY ---*\nProduct: ${currentProduct.name}\nPrice: ৳${currentProduct.price}\n_I want to purchase this!_`;
    window.open(`https://wa.me/8801XXXXXXXXX?text=${encodeURIComponent(message)}`, '_blank');
}

loadProductDetails();
