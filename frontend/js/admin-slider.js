const BASE_URL = 'https://website-production-f869.up.railway.app';

window.onload = () => {
    // ড্যাশবোর্ডের সিকিউরিটি লজিক অনুযায়ী চেক করা
    if (sessionStorage.getItem('adminAuth') !== "turjo0424") {
        window.location.href = 'admin-login.html'; 
    } else {
        fetchSliders();
    }
};

async function fetchSliders() {
    try {
        const res = await fetch(`${BASE_URL}/sliders`);
        const sliders = await res.json();
        const list = document.getElementById('slider-list-body');
        
        // আগে থেকে থাকা ২ টি ইমেজ সহ সব ডাটা এখানে দেখাবে
        list.innerHTML = sliders.map(s => `
            <tr class="border-b dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition">
                <td class="py-6 px-2">
                    <img src="${s.imageUrl}" class="w-32 h-16 rounded-xl object-cover shadow-md border dark:border-slate-700">
                </td>
                <td class="py-6 px-2">
                    <p class="font-bold text-sm dark:text-white">Duration: ${s.duration || 5}s</p>
                    <p class="text-[10px] text-slate-400 truncate w-40">${s.link || 'No Redirect Link'}</p>
                </td>
                <td class="py-6 px-2 text-right space-x-2">
                    <button onclick="editSlider('${s._id}', '${s.imageUrl}', '${s.link || ''}', ${s.duration || 5})" class="text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2.5 rounded-xl transition">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteSlider('${s._id}')" class="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 p-2.5 rounded-xl transition">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (err) { 
        console.error("Slider loading failed:", err); 
    }
}

function toggleModal() {
    const modal = document.getElementById('slider-modal');
    modal.classList.toggle('hidden');
    if (modal.classList.contains('hidden')) {
        document.getElementById('slider-form').reset();
        delete document.getElementById('slider-form').dataset.editId;
    }
}

// এডিট করার জন্য ডাটা ফিল্ডে বসানো
function editSlider(id, url, link, duration) {
    document.getElementById('s-image').value = url;
    document.getElementById('s-link').value = link;
    document.getElementById('s-duration').value = duration;
    document.getElementById('slider-form').dataset.editId = id; // ID সেভ করে রাখা
    toggleModal();
}

document.getElementById('slider-form').onsubmit = async (e) => {
    e.preventDefault();
    const editId = e.target.dataset.editId;
    const data = {
        imageUrl: document.getElementById('s-image').value,
        link: document.getElementById('s-link').value,
        duration: Number(document.getElementById('s-duration').value)
    };

    // যদি editId থাকে তবে PUT (Update), নাহলে POST (Add)
    const url = editId ? `${BASE_URL}/admin/edit-slider/${editId}` : `${BASE_URL}/admin/add-slider`;
    const method = editId ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (res.ok) {
            toggleModal();
            fetchSliders();
        }
    } catch (err) {
        alert("Operation failed!");
    }
};

async function deleteSlider(id) {
    if(confirm("Are you sure you want to delete this banner?")) {
        try {
            const res = await fetch(`${BASE_URL}/admin/delete-slider/${id}`, { method: 'DELETE' });
            if (res.ok) fetchSliders();
        } catch (err) {
            alert("Delete failed!");
        }
    }
}
