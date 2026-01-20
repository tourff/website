const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// রেলওয়ে ভেরিয়েবল থেকে পোর্ট এবং ডাটাবেজ লিঙ্ক নেওয়া
const PORT = process.env.PORT || 8080;
const mongoURI = process.env.MONGO_URI;

// ১. রেলওয়েকে সচল রাখার জন্য ডিফল্ট রুট
app.get('/', (req, res) => {
    res.status(200).send('Turjo Site Backend is Active and Running!');
});

// ২. ডাটাবেজ কানেকশন সেটআপ (উন্নত কানেকশন লজিক)
if (mongoURI) {
    mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
    })
    .then(() => {
        console.log("✅ MongoDB Connected Successfully!");
    })
    .catch(err => console.error("❌ MongoDB Connection Error:", err));
} else {
    console.error("❌ Error: MONGO_URI is not defined in Railway Variables!");
}

// ৩. প্রোডাক্ট স্কিমা ও মডেল
const productSchema = new mongoose.Schema({
    name: String,
    price: String,
    image: String
});
const Product = mongoose.model('Product', productSchema);

// ৪. রুটসমূহ
app.get('/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/admin/add-product', async (req, res) => {
    const { name, price, image } = req.body;
    const product = new Product({ name, price, image });
    try {
        const newProduct = await product.save();
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// ৫. সার্ভার লিসেনিং (এটি সবার শেষে থাকবে)
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is live on port ${PORT}`);
});
