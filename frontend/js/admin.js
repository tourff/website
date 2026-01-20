// আপনার রেলওয়ে পাবলিক ইউআরএল
const BASE_URL = 'https://website-production-f869.up.railway.app';

async function addProduct() {
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
            alert("সার্ভার থেকে এরর এসেছে। আপনার Railway লগ চেক করুন।");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("সার্ভারের সাথে যোগাযোগ করা সম্ভব হচ্ছে না!");
    }
}
