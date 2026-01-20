const BASE_URL = 'https://website-production-f869.up.railway.app';

function login() {
    const passwordField = document.getElementById('password').value;
    
    if (passwordField === 'admin123') {
        alert("লগইন সফল হয়েছে!");
        // HTML এর ID গুলোর সাথে মিল রাখা হয়েছে
        document.getElementById('login-box').style.display = 'none';
        document.getElementById('panel').style.display = 'block';
    } else {
        alert("ভুল পাসওয়ার্ড! আবার চেষ্টা করুন।");
    }
}

async function add() {
    const name = document.getElementById('name').value;
    const price = document.getElementById('price').value;
    const image = document.getElementById('imgUrl').value;

    if (!name || !price || !image) {
        alert("সবগুলো ঘর পূরণ করুন!");
        return;
    }

    const productData = { name, price, image };

    try {
        const response = await fetch(`${BASE_URL}/admin/add-product`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });

        if (response.ok) {
            alert("প্রোডাক্ট সফলভাবে Turjo Site-এ অ্যাড হয়েছে!");
            location.reload(); 
        } else {
            alert("সার্ভার থেকে এরর এসেছে। রেলওয়ে লগ চেক করুন।");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("সার্ভারের সাথে যোগাযোগ করা সম্ভব হচ্ছে না!");
    }
}
