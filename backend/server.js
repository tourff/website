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
    displayTime: { type: Number, default: 5000 }
}));

// ১. ইউজার মডেল (পাসওয়ার্ড সরাসরি সেভ হবে)
const User = mongoose.model('User', new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
}));

// --- রুটসমূহ ---

// ২. সাইনআপ রুট (কোনো হ্যাশিং নেই)
app.post('/auth/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Email already exists!" });

        const user = new User({ name, email, password }); // সরাসরি পাসওয়ার্ড সেভ
        await user.save();
        res.status(201).json({ message: "Account created successfully!" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ৩. লগইন রুট (সরাসরি টেক্সট তুলনা করা হবে)
app.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) return res.status(404).json({ message: "User not found!" });

        // ডাটাবেজের পাসওয়ার্ডের সাথে সরাসরি তুলনা
        if (user.password !== password) {
            return res.status(400).json({ message: "Invalid password!" });
        }

        res.json({ 
            message: "Login successful", 
            user: { name: user.name, email: user.email } 
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// প্রোডাক্টি ও ব্যানার রুটগুলো আগের মতোই থাকবে
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
        res.status(500).json({ message: err.message });
    }
});

app.delete('/admin/delete-product/:id', async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
});

app.get('/banners', async (req, res) => {
    const banners = await Banner.find();
    res.json(banners);
});

app.post('/admin/add-banner', async (req, res) => {
    const banner = new Banner(req.body);
    await banner.save();
    res.status(201).json(banner);
});

app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server on port ${PORT}`));
