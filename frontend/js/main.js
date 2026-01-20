<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Turjo Site | Premium Store</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <script>
        tailwind.config = { darkMode: 'class' }
        if (localStorage.getItem('theme') === 'light') document.documentElement.classList.remove('dark');
    </script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; transition: 0.3s; }
        .dark body { background-color: #030712; color: #f3f4f6; }
        .light body { background-color: #f9fafb; color: #111827; }
        .btn-primary { background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%); }
    </style>
</head>
<body>
    <nav class="sticky top-0 z-50 backdrop-blur-md dark:bg-[#030712]/80 dark:border-b dark:border-white/5 light:bg-white/80 light:border-b light:border-gray-200">
        <div class="container mx-auto px-6 py-4 flex justify-between items-center">
            <div class="flex items-center gap-2">
                <div class="w-10 h-10 btn-primary rounded-xl flex items-center justify-center"><i class="fas fa-bolt text-white"></i></div>
                <span class="text-xl font-extrabold tracking-tighter dark:text-white light:text-gray-900 uppercase">TURJO SITE</span>
            </div>
            <div id="nav-auth" class="flex items-center gap-4">
                <button onclick="toggleTheme()" class="bg-gray-500/10 p-2.5 rounded-full"><i id="theme-icon" class="fas fa-moon text-rose-500"></i></button>
            </div>
        </div>
    </nav>

    <div class="container mx-auto px-6 pt-10">
        <div class="max-w-2xl mx-auto relative">
            <input type="text" id="search-input" onkeyup="searchProducts()" placeholder="Search services..." class="w-full py-4 px-12 rounded-2xl border outline-none dark:bg-white/5 dark:border-white/10 dark:text-white light:bg-white light:border-gray-200 light:text-gray-900 shadow-xl">
            <i class="fas fa-search absolute left-5 top-5 text-gray-500"></i>
        </div>
    </div>

    <main class="container mx-auto px-6 py-12">
        <div id="products-container" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6"></div>
    </main>

    <script src="js/main.js"></script>
    <script>
        function toggleTheme() {
            const html = document.documentElement;
            const icon = document.getElementById('theme-icon');
            if (html.classList.contains('dark')) {
                html.classList.remove('dark'); icon.classList.replace('fa-moon', 'fa-sun'); localStorage.setItem('theme', 'light');
            } else {
                html.classList.add('dark'); icon.classList.replace('fa-sun', 'fa-moon'); localStorage.setItem('theme', 'dark');
            }
        }
    </script>
</body>
</html>
