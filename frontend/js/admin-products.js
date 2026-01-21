function toggleModal() { document.getElementById('p-modal')?.classList.toggle('hidden'); }
async function fetchInventory() {
    const list = document.getElementById('inventory-list');
    try {
        const res = await fetch(`${BASE_URL}/products`);
        const products = await res.json();
        list.innerHTML = products.map(p => `
            <tr class="hover:bg-slate-50 dark:hover:bg-white/5 transition">
                <td class="py-4 px-2 text-xs font-bold dark:text-white">${p.name}</td>
                <td class="py-4 px-2 text-xs dark:text-white">৳${p.price}</td>
                <td class="py-4 px-2"><span class="px-2 py-1 rounded text-[9px] font-bold uppercase bg-green-100 text-green-600">${p.stockQuantity} Stock</span></td>
                <td class="py-4 px-2 text-right text-rose-500 cursor-pointer"><i class="fas fa-trash"></i></td>
            </tr>`).join('');
    } catch (e) { list.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-rose-500 font-bold uppercase text-xs">Error loading data</td></tr>'; }
}
fetchInventory();
