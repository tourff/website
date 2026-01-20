// ১. ইউজার ডাটা চেক এবং লোড
const user = localStorage.getItem('user');

if (!user) {
    // লগইন করা না থাকলে হোম পেজে পাঠিয়ে দাও
    window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', () => {
    // ইউজারের নাম সেট করা
    document.getElementById('user-name').innerText = user;
    document.getElementById('edit-name').value = user;
    
    // অবতারের জন্য নামের প্রথম অক্ষর বের করা
    const initials = user.charAt(0).toUpperCase();
    document.getElementById('user-avatar').innerText = initials;
});

// ২. প্রোফাইল আপডেট ফাংশন
function updateProfile() {
    const newName = document.getElementById('edit-name').value;
    
    if (newName.length < 3) {
        alert("Name is too short!");
        return;
    }
    
    // লোকাল স্টোরেজে নতুন নাম সেভ করা
    localStorage.setItem('user', newName);
    alert("Profile Updated Successfully!");
    window.location.reload();
}

// ৩. লগআউট ফাংশন
function logout() {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}
