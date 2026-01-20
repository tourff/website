const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;
const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI).then(() => console.log("✅ MongoDB Connected"));

const Product = require('./models/Product');

// ১. সব প্রোডাক্ট দেখা
app.get('/products', async (req, res) => {
    const products = await Product.find();
    res.json(products);
});

// ২. প্রোডাক্ট অ্যাড করা
app.post('/admin/add-product', async (req, res) => {
    const { name, price, image } = req.body;
    const product = new Product({ name, price, image, inStock: true });
    await product.save();
    res.status(201).json(product);
});

// ৩. প্রোডাক্ট ডিলিট করা
app.delete('/admin/delete-product/:id', async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted Successfully" });
});

// ৪. স্টকের অবস্থা পরিবর্তন করা (Toggle Stock)
app.patch('/admin/toggle-stock/:id', async (req, res) => {
    const product = await Product.findById(req.params.id);
    product.inStock = !product.inStock;
    await product.save();
    res.json(product);
});

app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server on ${PORT}`));
