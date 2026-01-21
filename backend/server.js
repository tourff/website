const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;
const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI)
    .then(() => console.log("✅ MongoDB Connected Successfully!"))
    .catch(err => console.error(err));

// --- মডলেসমূহ ---

const Product = mongoose.model('Product', new mongoose.Schema({
    name: String, 
    price: Number, 
    oldPrice: Number, 
    image: String, 
    inStock: { type: Boolean, default: true },
    stockQuantity: { type: Number, default: 99 },
    soldCount: { type: Number, default: 0 },
    ratings: { type: Number, default: 5.0 },
    reviews: { type: Number, default: 0 },
    description: String,
    category: String
}));

const Banner = mongoose.model('Banner', new mongoose.Schema({
    imageUrl: { type: String, required: true },
    link: { type: String, default: "" },
    duration: { type: Number, default: 5 }
}));

const User = mongoose.model('User', new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
}));

const Order = mongoose.model('Order', new mongoose.Schema({
    userName: String,
    userEmail: String,
    products: Array, 
    totalAmount: Number,
    status: { type: String, default: 'Pending' }, 
    orderedAt: { type: Date, default: Date.now }
}));

// --- রুটসমূহ ---

app.get('/admin/analytics', async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments();
        const totalUsers = await User.countDocuments();
        const orders = await Order.find();
        const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        const startOfToday = new Date();
        startOfToday.setHours(0,0,0,0);
        const todayOrders = await Order.find({ orderedAt: { $gte: startOfToday } });
        const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

        res.json({ 
            totalProducts, 
            totalUsers, 
            totalRevenue, 
            todayRevenue,
            totalOrders: orders.length 
        });
    } catch (err) {
        res.status(500).json({ message: "Analytics fetch failed!" });
    }
});

app.get('/admin/chart-data', async (req, res) => {
    try {
        const orders = await Order.find().sort({ orderedAt: 1 }).limit(10);
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: "Chart data failed!" });
    }
});

app.get('/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ orderedAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: "Orders fetch failed!" });
    }
});

app.patch('/admin/update-order/:id', async (req, res) => {
    try {
        const { status } = req.body;
        const updatedOrder = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
        res.json(updatedOrder);
    } catch (err) {
        res.status(500).json({ message: "Update failed!" });
    }
});

app.delete('/admin/delete-order/:id', async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id);
        res.json({ message: "Order deleted successfully!" });
    } catch (err) {
        res.status(500).json({ message: "Delete failed!" });
    }
});

app.post('/auth/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Email already exists!" });
        const user = new User({ name, email, password }); 
        await user.save();
        res.status(201).json({ message: "Account created successfully!" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || user.password !== password) {
            return res.status(400).json({ message: "Invalid credentials!" });
        }
        res.json({ message: "Login successful", user: { name: user.name, email: user.email } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/products', async (req, res) => {
    const products = await Product.find();
    res.json(products);
});

app.post('/admin/add-product', async (req, res) => {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
});

app.put('/admin/edit-product/:id', async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedProduct);
    } catch (err) {
        res.status(500).json({ message: "Update failed" });
    }
});

app.delete('/admin/delete-product/:id', async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
});

// --- স্লাইডার/ব্যানার রুটসমূহ ---

// অ্যাডমিন প্যানেলের জন্য (/sliders)
app.get('/sliders', async (req, res) => {
    try {
        const banners = await Banner.find();
        res.json(banners);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch sliders" });
    }
});

// মেইন ওয়েবসাইটের জন্য (/banners) - এটি ৪0৪ এরর দূর করবে
app.get('/banners', async (req, res) => {
    try {
        const banners = await Banner.find();
        res.json(banners);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch banners" });
    }
});

app.post('/admin/add-slider', async (req, res) => {
    try {
        const banner = new Banner(req.body);
        await banner.save();
        res.status(201).json(banner);
    } catch (err) {
        res.status(500).json({ message: "Failed to add slider" });
    }
});

app.put('/admin/edit-slider/:id', async (req, res) => {
    try {
        const updatedSlider = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedSlider);
    } catch (err) {
        res.status(500).json({ message: "Update failed" });
    }
});

app.delete('/admin/delete-slider/:id', async (req, res) => {
    try {
        await Banner.findByIdAndDelete(req.params.id);
        res.json({ message: "Slider deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Delete failed" });
    }
});

app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server on port ${PORT}`));
