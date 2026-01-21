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

        // ১. ডাটা কার্ডসমূহ আপডেট করা (ID ধরে)
        updateEl('total-v', data.totalUsers); 
        updateEl('today-v', data.todayNewUsers);
        updateEl('risk-v', data.highRiskOrders);

        // ২. ডিভাইস ব্রেকডাউন আপডেট
        if (data.deviceStats) {
            updateEl('dev-mob', `${data.deviceStats.mobile || 74}%`);
            updateEl('dev-desk', `${data.deviceStats.desktop || 22}%`);
            updateEl('dev-bot', `${data.deviceStats.bot || 4}%`);
        }

        console.log("User Intelligence Synced ✅", new Date().toLocaleTimeString());

    } catch (err) {
        console.error("User Intelligence Sync Error:", err);
    }
}

// হেল্পার ফাংশন যাতে কোড ক্লিন থাকে
function updateEl(id, value) {
    const el = document.getElementById(id);
    if (el && value !== undefined) {
        el.innerText = value;
    }
}

function handleAdminLogout() {
    if(confirm("Logout from User Intelligence?")) {
        sessionStorage.removeItem('adminAuth');
        window.location.href = 'admin-login.html';
    }
}
