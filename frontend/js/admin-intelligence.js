const BASE_URL = 'https://website-production-f869.up.railway.app';

window.onload = () => {
    // সিকিউরিটি চেক: শুধু অ্যাডমিন ঢুকতে পারবে
    const auth = sessionStorage.getItem('adminAuth');
    if (auth !== "turjo0424") {
        window.location.href = 'admin-login.html'; 
    } else {
        fetchIntelligenceData();
        // প্রতি ৩০ সেকেন্ড পর পর ডাটা অটো আপডেট হবে
        setInterval(fetchIntelligenceData, 30000); 
    }
};

async function fetchIntelligenceData() {
    try {
        // ব্যাকএন্ড থেকে অ্যানালিটিক্স ডাটা আনা
        const res = await fetch(`${BASE_URL}/admin/user-intelligence`);
        if (!res.ok) throw new Error("Failed to load intelligence data");
        
        const data = await res.json();

        // ১. ডাটা কার্ডসমূহ আপডেট করা (Metric Cards)
        document.querySelector('.metric-card:nth-child(1) h4').innerText = data.totalUsers || 0; 
        document.querySelector('.metric-card:nth-child(2) h4').innerText = data.todayNewUsers || 0;
        document.querySelector('.metric-card:nth-child(3) h4').innerText = Math.floor(Math.random() * 10) + 1; // ডেমো একটিভ ইউজার
        document.querySelector('.metric-card:nth-child(4) h4').innerText = "98%"; 
        document.querySelector('.metric-card:nth-child(5) h4').innerText = data.highRiskOrders || 0;
        document.querySelector('.metric-card:nth-child(6) h4').innerText = "0"; // Bot count

        // ২. ডিভাইস ব্রেকডাউন আপডেট (Device Breakdown)
        // এখানে আপনার ব্যাকএন্ডের ডাটা অনুযায়ী পার্সেন্টেজ বসবে
        updateDeviceStats(data.deviceStats);

    } catch (err) {
        console.error("User Intelligence Sync Error:", err);
    }
}

function updateDeviceStats(stats) {
    // স্যাম্পল স্ট্যাটাস আপডেট লজিক
    const mobileEl = document.querySelector('.fa-mobile-alt').parentElement.nextElementSibling;
    const desktopEl = document.querySelector('.fa-desktop').parentElement.nextElementSibling;
    
    if (stats) {
        mobileEl.innerText = `${stats.mobile || 70}%`;
        desktopEl.innerText = `${stats.desktop || 30}%`;
    }
}

function logout() {
    if(confirm("Logout from User Intelligence?")) {
        sessionStorage.removeItem('adminAuth');
        window.location.href = 'admin-login.html';
    }
}
