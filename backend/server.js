const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// ১. ডাটাবেজ কানেকশন
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ Connection Error:', err));

// ২. প্রোডাক্ট মডেল
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    oldPrice: { type: Number },
    image: { type: String, required: true },
    description: { type: String },
    inStock: { type: Boolean, default: true }
});
const Product = mongoose.model('Product', productSchema);

// ৩. পাবলিক রুট: সব প্রোডাক্ট (৫০০ এরর হ্যান্ডলিং সহ)
app.get('/products', async (req, res) => {
    try {
        const products = await Product.find() || [];
        res.status(200).json(products); 
    } catch (err) {
        res.status(500).json([]); 
    }
});

// ৪. অ্যাডমিন রুট: প্রোডাক্ট পাবলিশ
app.post('/admin/add-product', async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.status(201).json({ success: true });
    } catch (err) {
        res.status(400).json({ success: false });
    }
});

// ৫. স্টক ও ডিলিট ম্যানেজমেন্ট
app.patch('/admin/toggle-stock/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        product.inStock = !product.inStock;
        await product.save();
        res.json({ inStock: product.inStock });
    } catch (err) { res.status(500).send(); }
});

app.delete('/admin/delete-product/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted" });
    } catch (err) { res.status(500).send(); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server live on port ${PORT}`));
