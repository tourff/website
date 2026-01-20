const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// রেলওয়ে ভেরিয়েবল থেকে পোর্ট এবং ডাটাবেজ লিঙ্ক নেওয়া
const PORT = process.env.PORT || 5000;
const mongoURI = process.env.MONGO_URI;

// ডাটাবেজ কানেকশন সেটআপ
if (mongoURI) {
    mongoose.connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log("✅ MongoDB Connected Successfully!"))
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
    const product = new Product({
        name: req.body.name,
        price: req.body.price,
        image: req.body.image
    });

    try {
        const newProduct = await product.save();
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
