
fetch('https://website-production-f869.up.railway.app/products')
  .then(res => res.json())
  .then(data => {
    const d = document.getElementById('products');
    data.forEach(p => {
      d.innerHTML += `<h3>${p.name}</h3><p>${p.price}</p>`;
    });
  });
