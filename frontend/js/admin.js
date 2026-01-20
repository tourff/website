const BASE_URL = 'https://website-production-f869.up.railway.app';

function login() {
    const passwordField = document.getElementById('password').value;
    if (passwordField === 'admin123') {
        alert("লগইন সফল হয়েছে!");
        document.getElementById('login-box').style.display = 'none';
        document.getElementById('panel').style.display = 'block';
    } else {
        alert("ভুল পাসওয়ার্ড!");
    }
}

async function add() {
    const name = document.getElementById('name').value;
    const price = document.getElementById('price').value;
    const oldPrice = document.getElementById('oldPrice').value;
    const customDiscount = document.getElementById('customDiscount').value;
    const description = document.getElementById('description').value;
    const image = document.getElementById('imgUrl').value;

    if (!name || !price || !image) {
        alert("নাম, দাম এবং ছবি দেওয়া বাধ্যতামূলক!");
        return;
    }

    const productData = { name, price, oldPrice, customDiscount, description, image };

    try {
        const response = await fetch(`${BASE_URL}/admin/add-product`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });

        if (response.ok) {
            alert("প্রোডাক্ট সফলভাবে অ্যাড হয়েছে!");
            location.reload(); 
        }
    } catch (error) {
        alert("সার্ভারে ডাটা পাঠানো সম্ভব হয়নি!");
    }
}
