// Apnar Railway-r Public Domain link eikhane boshun
const API_URL = 'https://website-production-f869.up.railway.app'; 

fetch(`${API_URL}/products`)
  .then(res => {
    if (!res.ok) throw new Error('Network response was not ok');
    return res.json();
  })
  .then(data => {
    const container = document.getElementById('products');
    container.innerHTML = ''; // Clear previous content
    data.forEach(p => {
      container.innerHTML += `
        <div class="product-card">
          <h3>${p.name}</h3>
          <p>Price: ${p.price} BDT</p>
        </div>`;
    });
  })
  .catch(err => {
    console.error('Fetch error:', err);
    document.body.innerHTML += '<p style="color:red">Backend connection failed!</p>';
  });
