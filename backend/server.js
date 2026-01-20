const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// রেলওয়ে ভেরিয়েবল থেকে পোর্ট এবং ডাটাবেজ লিঙ্ক নেওয়া
const PORT = process.env.PORT || 8080;
const mongoURI = process.env.MONGO_URI;

// ১. ডিফল্ট রুট (রেলওয়ে সার্ভারকে সচল রাখার জন্য এটি জরুরি)
app.get('/', (req, res) => {
    res.status(200).send('Turjo Site Backend is Active and Running!');
});

// ডাটাবেজ কানেকশন সেটআপ
if (mongoURI) {
    mongoose.connect(mongoURI)
    .then(() => {
        console.log("✅ MongoDB Connected Successfully!");
        // সার্ভার লিসেনিং নিশ্চিত করা
        app.listen(PORT, () => {
            console.log(`🚀 Server is live on port ${PORT}`);
        });
    })
    .catch(err => console.error("❌ MongoDB Connection Error:", err));
} else {
    console.error("❌ Error: MONGO_URI is not defined in Railway Variables!");
}

// প্রোডাক্ট স্কিমা
const productSchema = new mongoose.Schema({
    name: String,
    price: String,
    image: String
});
const Product = mongoose.model('Product', productSchema);

// ডাটাবেজ থেকে সব প্রোডাক্ট পাওয়ার রুট
app.get('/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// অ্যাডমিন প্যানেল থেকে নতুন প্রোডাক্ট অ্যাড করার রুট
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
