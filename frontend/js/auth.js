// সাইন-আপ ফাংশন
async function handleSignup() {
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-pass').value;

    const res = await fetch(`${BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();
    alert(data.message);
    if(res.ok) window.location.href = 'login.html';
}

// লগইন ফাংশন
async function handleLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-pass').value;

    const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (res.ok) {
        // ইউজারের নাম ব্রাউজারে সেভ রাখা যাতে হোম পেজে দেখানো যায়
        localStorage.setItem('loggedInUser', data.userName);
        window.location.href = 'index.html';
    } else {
        alert(data.message);
    }
}
