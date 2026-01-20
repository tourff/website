const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs'); // পাসওয়ার্ড হ্যাস করার জন্য
const jwt = require('jsonwebtoken'); // টোকেন জেনারেট করার জন্য
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = "turjo_site_ultra_secret_key_2026"; // এটি আপনার সিক্রেট কী

// ১. ডাটাবেজ কানেকশন
mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected Successfully"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// ২. ডাটাবেজ স্কিমা সমূহ
const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    oldPrice: Number,
    image: String,
    description: String,
    customDiscount: String
});
const Product = mongoose.model('Product', productSchema);

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

// --- ৩. প্রোডাক্ট রুটস (অ্যাডমিন ও ইউজার সবার জন্য) ---
app.get('/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/admin/add-product', async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json(product);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.delete('/admin/delete-product/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: "Product deleted successfully!" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- ৪. ইউজার অথেনটিকেশন রুটস (লগইন ও রেজিস্ট্রেশন) ---

// রেজিস্ট্রেশন রুট
app.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // চেক করা হচ্ছে ইউজার আগে থেকেই আছে কি না
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists!" });

        // পাসওয়ার্ড এনক্রিপ্ট করা
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: "Registration Successful!" });
    } catch (err) {
        res.status(500).json({ message: "Server error during registration!" });
    }
});

// লগইন রুট
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // ইউজার চেক
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found!" });

        // পাসওয়ার্ড ভেরিফাই করা
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials!" });

        // JWT টোকেন তৈরি
        const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '1d' });
        
        res.json({ 
            message: "Login Successful", 
            token, 
            username: user.username 
        });
    } catch (err) {
        res.status(500).json({ message: "Server error during login!" });
    }
});

// সার্ভার চালু করা
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Turjo Site Backend is running on port ${PORT}`);
});
