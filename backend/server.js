const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// ১. ডাটাবেজ কানেকশন
mongoose.connect(process.env.MONGODB_URI || 'your_mongodb_url_here')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// ২. প্রোডাক্ট মডেল (ইন-স্টক ফিচারসহ)
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    oldPrice: { type: Number },
    image: { type: String, required: true },
    description: { type: String },
    customDiscount: { type: String },
    inStock: { type: Boolean, default: true } // স্টক ম্যানেজমেন্টের জন্য
});

const Product = mongoose.model('Product', productSchema);

// ৩. পাবলিক রুট: সব প্রোডাক্ট পাওয়া
app.get('/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: "Error fetching products" });
    }
});

// ৪. অ্যাডমিন রুট: নতুন প্রোডাক্ট অ্যাড করা
app.post('/admin/add-product', async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.status(201).json({ message: "Product added successfully!" });
    } catch (err) {
        res.status(400).json({ message: "Error adding product" });
    }
});

// ৫. অ্যাডমিন রুট: স্টক স্ট্যাটাস পরিবর্তন করা (Toggle Stock)
app.patch('/admin/toggle-stock/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });

        product.inStock = !product.inStock; // ট্রু থাকলে ফলস হবে, ফলস থাকলে ট্রু
        await product.save();
        res.json({ message: "Stock status updated!", inStock: product.inStock });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// ৬. অ্যাডমিন রুট: প্রোডাক্ট ডিলিট করা
app.delete('/admin/delete-product/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: "Product deleted!" });
    } catch (err) {
        res.status(500).json({ message: "Delete failed" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
