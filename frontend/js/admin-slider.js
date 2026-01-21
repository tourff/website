const BASE_URL = 'https://website-production-f869.up.railway.app';

window.onload = () => {
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
        
        list.innerHTML = sliders.map(s => `
            <tr class="border-b dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition">
                <td class="py-6 px-2">
                    <img src="${s.imageUrl}" class="w-32 h-16 rounded-xl object-cover shadow-md">
                </td>
                <td class="py-6 px-2">
                    <p class="font-bold text-sm">Duration: ${s.duration || 5}s</p>
                    <p class="text-[10px] text-slate-400 truncate w-40">${s.link || 'No Link'}</p>
                </td>
                <td class="py-6 px-2 text-right">
                    <button onclick="deleteSlider('${s._id}')" class="text-rose-500 hover:bg-rose-50 p-2.5 rounded-xl transition"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    } catch (err) { console.error(err); }
}

function toggleModal() {
    document.getElementById('slider-modal').classList.toggle('hidden');
}

document.getElementById('slider-form').onsubmit = async (e) => {
    e.preventDefault();
    const data = {
        imageUrl: document.getElementById('s-image').value,
        link: document.getElementById('s-link').value,
        duration: Number(document.getElementById('s-duration').value)
    };

    await fetch(`${BASE_URL}/admin/add-slider`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    toggleModal();
    fetchSliders();
};

async function deleteSlider(id) {
    if(confirm("Delete this banner?")) {
        await fetch(`${BASE_URL}/admin/delete-slider/${id}`, { method: 'DELETE' });
        fetchSliders();
    }
}
