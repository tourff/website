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
    name: { type: String, required: true }, 
    price: { type: Number, required: true }, 
    oldPrice: { type: Number, default: null }, 
    image: { type: String, required: true }, 
    inStock: { type: Boolean, default: true },
    stockQuantity: { type: Number, default: 0 },
    description: { type: String, default: "" },
    category: { type: String, default: "General" },
    soldCount: { type: Number, default: 0 },
    ratings: { type: Number, default: 5.0 },
    reviews: { type: Number, default: 0 }
}, { timestamps: true }));

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

// ১. ড্যাশবোর্ড অ্যানালিটিক্স
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

// ২. প্রোডাক্ট রুটসমূহ (Updated for Inventory System)
app.get('/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: "Products fetch failed!" });
    }
});

app.post('/admin/add-product', async (req, res) => {
    try {
        const productData = {
            name: req.body.name,
            price: req.body.price,
            oldPrice: req.body.oldPrice,
            image: req.body.image,
            stockQuantity: req.body.stock, // UI থেকে 'stock' হিসেবে আসছে
            description: req.body.desc,    // UI থেকে 'desc' হিসেবে আসছে
            inStock: req.body.stock > 0
        };
        const product = new Product(productData);
        await product.save();
        res.status(201).json(product);
    } catch (err) {
        res.status(500).json({ message: "Failed to add product" });
    }
});

app.put('/admin/edit-product/:id', async (req, res) => {
    try {
        const updateData = {
            name: req.body.name,
            price: req.body.price,
            oldPrice: req.body.oldPrice,
            image: req.body.image,
            stockQuantity: req.body.stock,
            description: req.body.desc,
            inStock: req.body.stock > 0
        };
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(updatedProduct);
    } catch (err) {
        res.status(500).json({ message: "Update failed" });
    }
});

app.delete('/admin/delete-product/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: "Product deleted" });
    } catch (err) {
        res.status(500).json({ message: "Delete failed" });
    }
});

// ৩. অর্ডার ম্যানেজমেন্ট
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

// ৪. স্লাইডার এবং ইউজার অথ (বাকি রুটগুলো অপরিবর্তিত)
app.get('/sliders', async (req, res) => {
    const banners = await Banner.find();
    res.json(banners);
});

app.get('/banners', async (req, res) => {
    const banners = await Banner.find();
    res.json(banners);
});

app.post('/admin/add-slider', async (req, res) => {
    const banner = new Banner(req.body);
    await banner.save();
    res.status(201).json(banner);
});

app.delete('/admin/delete-slider/:id', async (req, res) => {
    await Banner.findByIdAndDelete(req.params.id);
    res.json({ message: "Slider deleted" });
});

app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.password !== password) return res.status(400).json({ message: "Invalid credentials!" });
    res.json({ message: "Login successful", user: { name: user.name, email: user.email } });
});

app.get('/admin/user-intelligence', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const startOfToday = new Date();
        startOfToday.setHours(0,0,0,0);
        const todayNewUsers = await User.countDocuments({ createdAt: { $gte: startOfToday } });
        res.json({ totalUsers, todayNewUsers, deviceStats: { mobile: 74, desktop: 26 } });
    } catch (err) {
        res.status(500).json({ message: "Intelligence failed" });
    }
});

app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server on port ${PORT}`));
