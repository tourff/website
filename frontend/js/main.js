
fetch('https://YOUR_BACKEND_URL/products')
  .then(res => res.json())
  .then(data => {
    const d = document.getElementById('products');
    data.forEach(p => {
      d.innerHTML += `<h3>${p.name}</h3><p>${p.price}</p>`;
    });
  });
