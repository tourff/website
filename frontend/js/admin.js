
// আপনার রেলওয়ে পাবলিক ইউআরএল (নিশ্চিত করুন শেষে '/' নেই)
const BASE_URL = 'https://website-production-f869.up.railway.app';

function login(){
  const pass = document.getElementById('password').value;
  
  fetch(`${BASE_URL}/admin/login`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({password: pass})
  })
  .then(res => res.json())
  .then(data => {
    if(data.success) {
      document.getElementById('login-box').style.display = 'none';
      document.getElementById('panel').style.display = 'block';
    } else {
      alert("ভুল পাসওয়ার্ড! আবার চেষ্টা করুন।");
    }
  })
  .catch(err => alert("সার্ভারের সাথে যোগাযোগ করা যাচ্ছে না!"));
}

function add(){
  const name = document.getElementById('name').value;
  const price = document.getElementById('price').value;
  const image = document.getElementById('imgUrl').value;

  // ইনপুট খালি কি না চেক করা
  if(!name || !price || !image) {
    alert("দয়া করে সব ঘর পূরণ করুন!");
    return;
  }

  const productData = { name, price, image };

  // বাটনটি ডিসেবল করা যাতে বারবার ক্লিক না হয়
  const btn = document.querySelector('button[onclick="add()"]');
  btn.innerText = "Publishing...";
  btn.disabled = true;

  fetch(`${BASE_URL}/admin/add-product`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData)
  })
  .then(res => {
    if(res.ok) {
      alert("Product added successfully to Turjo Site!");
      location.reload(); // পেজ রিফ্রেশ করে নতুন ডাটা দেখাবে
    } else {
      throw new Error("Failed to add product");
    }
  })
  .catch(err => {
    console.error(err);
    alert("এরর: প্রোডাক্ট অ্যাড হয়নি। আপনার Railway লগ চেক করুন।");
  })
  .finally(() => {
    btn.innerText = "Publish Product";
    btn.disabled = false;
  });
}
