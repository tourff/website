const BASE_URL = 'https://website-production-f869.up.railway.app';
const ADMIN_PASS = "turjo0424";
let revenueChartInstance = null;

window.onload = () => {
    const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
    const dateEl = document.getElementById('current-date');
    if (dateEl) dateEl.innerText = new Date().toLocaleDateString('en-US', options);

    const auth = localStorage.getItem('adminAuth');
    if (auth !== ADMIN_PASS) {
        window.location.href = 'admin-login.html'; 
    } else {
        initDashboard();
        initTheme(); 
        initProductActions(); // প্রোডাক্ট বাটন লজিক শুরু করা
    }
};

// --- প্রোডাক্ট ম্যানেজমেন্ট ফাংশনসমূহ ---

function initProductActions() {
    // কুইক এক্সেস বাটন ক্লিক করলে প্রোডাক্ট সেকশন দেখাবে
    const productBtn = document.getElementById('quick-products');
    if (productBtn) {
        productBtn.onclick = () => {
            const sec = document.getElementById('product-management');
            sec.classList.remove('hidden');
            window.scrollTo({ top: sec.offsetTop - 100, behavior: 'smooth' });
            loadInventory();
        };
    }

    // প্রোডাক্ট ফর্ম সাবমিট (Add/Edit)
    const productForm = document.getElementById('product-form');
    if (productForm) {
        productForm.onsubmit = async (e) => {
            e.preventDefault();
            const id = document.getElementById('edit-id').value;
            const data = {
                name: document.getElementById('p-name').value,
                price: Number(document.getElementById('p-price').value),
                image: document.getElementById('p-image').value,
                description: document.getElementById('p-desc').value
            };

            const url = id ? `${BASE_URL}/admin/edit-product/${id}` : `${BASE_URL}/admin/add-product`;
            const method = id ? 'PUT' : 'POST';

            try {
                const res = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                if (res.ok) {
                    toggleAddModal();
                    loadInventory();
                }
            } catch (err) {
                console.error("Product save failed:", err);
            }
        };
    }
}

// ইনভেন্টরি লোড করা
async function loadInventory() {
    try {
        const res = await fetch(`${BASE_URL}/products`);
        const products = await res.json();
        const tbody = document.getElementById('product-list-body');
        
        if (tbody) {
            tbody.innerHTML = products.map(p => `
                <tr class="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                    <td class="py-4 px-2">
                        <div class="flex items-center gap-3">
                            <img src="${p.image}" class="w-10 h-10 rounded-lg object-cover">
                            <span class="font-bold text-xs">${p.name}</span>
                        </div>
                    </td>
                    <td class="py-4 px-2 font-black text-xs text-blue-600 dark:text-rose-400">৳${p.price}</td>
                    <td class="py-4 px-2 text-right space-x-2">
                        <button onclick="editProduct('${p._id}')" class="text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2 rounded-lg transition"><i class="fas fa-edit"></i></button>
                        <button onclick="deleteProduct('${p._id}')" class="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 p-2 rounded-lg transition"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (err) {
        console.error("Inventory load failed:", err);
    }
}

// মোডাল কন্ট্রোল
function toggleAddModal() {
    const modal = document.getElementById('product-modal');
    if (modal) {
        modal.classList.toggle('hidden');
        document.getElementById('product-form').reset();
        document.getElementById('edit-id').value = '';
        document.getElementById('modal-title').innerText = "Add Product";
    }
}

// এডিট করার ডাটা ফেচ করা
async function editProduct(id) {
    try {
        const res = await fetch(`${BASE_URL}/products`);
        const products = await res.json();
        const p = products.find(item => item._id === id);
        
        if (p) {
            document.getElementById('edit-id').value = p._id;
            document.getElementById('p-name').value = p.name;
            document.getElementById('p-price').value = p.price;
            document.getElementById('p-image').value = p.image;
            document.getElementById('p-desc').value = p.description || '';
            
            document.getElementById('modal-title').innerText = "Edit Product";
            document.getElementById('product-modal').classList.remove('hidden');
        }
    } catch (err) {
        console.error("Edit fetch failed:", err);
    }
}

// প্রোডাক্ট ডিলিট
async function deleteProduct(id) {
    if(confirm("Are you sure? This product will be removed!")) {
        try {
            const res = await fetch(`${BASE_URL}/admin/delete-product/${id}`, { method: 'DELETE' });
            if (res.ok) loadInventory();
        } catch (err) {
            console.error("Delete failed:", err);
        }
    }
}

// --- আপনার আগের থিম ও ড্যাশবোর্ড লজিক ---

function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    if (localStorage.getItem('theme') === 'dark') {
        document.documentElement.classList.add('dark');
        if (themeIcon) themeIcon.classList.replace('fa-moon', 'fa-sun');
    }
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark');
            if (document.documentElement.classList.contains('dark')) {
                localStorage.setItem('theme', 'dark');
                if (themeIcon) themeIcon.classList.replace('fa-moon', 'fa-sun');
            } else {
                localStorage.setItem('theme', 'light');
                if (themeIcon) themeIcon.classList.replace('fa-sun', 'fa-moon');
            }
            refreshData(); 
        });
    }
}

async function initDashboard() {
    refreshData();
    setInterval(refreshData, 30000); 
}

async function refreshData() {
    try {
        const response = await fetch(`${BASE_URL}/orders`);
        const orders = await response.json();
        updateStats(orders);
        renderChart(orders);
    } catch (err) {
        console.error("Dashboard Sync Failed:", err);
    }
}

function updateStats(orders) {
    const startOfToday = new Date();
    startOfToday.setHours(0,0,0,0);
    const todayOrders = orders.filter(o => new Date(o.orderedAt) >= startOfToday);
    const todayRev = todayOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);
    const incomeEl = document.getElementById('today-income');
    const orderCountEl = document.getElementById('month-orders');
    if (incomeEl) incomeEl.innerText = `৳${todayRev.toLocaleString()}`;
    if (orderCountEl) orderCountEl.innerText = `${orders.length} orders`;
}

function renderChart(orders) {
    const chartCanvas = document.getElementById('revenueChart');
    if (!chartCanvas) return;
    const ctx = chartCanvas.getContext('2d');
    if (revenueChartInstance) revenueChartInstance.destroy();
    const last7Orders = orders.slice(-7); 
    const isDark = document.documentElement.classList.contains('dark');
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0,0,0,0.05)';
    const textColor = isDark ? '#94a3b8' : '#64748b';
    
    revenueChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: last7Orders.map(o => new Date(o.orderedAt).toLocaleDateString()),
            datasets: [{ 
                label: 'Revenue Growth',
                data: last7Orders.map(o => o.totalAmount), 
                borderColor: isDark ? '#f43f5e' : '#2563eb',
                backgroundColor: isDark ? 'rgba(244, 63, 94, 0.1)' : 'rgba(37, 99, 235, 0.1)',
                tension: 0.4, 
                fill: true 
            }]
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false, 
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: textColor } },
                x: { grid: { display: false }, ticks: { color: textColor } }
            }
        }
    });
}

function handleAdminLogout() {
    if(confirm("Are you sure you want to logout?")) {
        localStorage.removeItem('adminAuth'); 
        window.location.href = 'admin-login.html'; 
    }
}
