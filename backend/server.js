const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;
const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI).then(() => console.log("✅ MongoDB Connected Successfully!")).catch(err => console.error(err));

// --- মডলেসমূহ ---
const Product = mongoose.model('Product', new mongoose.Schema({
    name: String, price: Number, image: String, inStock: { type: Boolean, default: true }
}));

const Banner = mongoose.model('Banner', new mongoose.Schema({
    imageUrl: { type: String, required: true },
    displayTime: { type: Number, default: 5000 }
}));

// --- রুটসমূহ ---

// ১. প্রোডাক্ট রুট
app.get('/products', async (req, res) => {
    const products = await Product.find();
    res.json(products);
});

app.post('/admin/add-product', async (req, res) => {
    const { name, price, image } = req.body;
    const product = new Product({ name, price, image });
    await product.save();
    res.status(201).json(product);
});

app.delete('/admin/delete-product/:id', async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
});

app.patch('/admin/toggle-stock/:id', async (req, res) => {
    const product = await Product.findById(req.params.id);
    product.inStock = !product.inStock;
    await product.save();
    res.json(product);
});

// ২. ব্যানার রুট
app.get('/banners', async (req, res) => {
    const banners = await Banner.find();
    res.json(banners);
});

app.post('/admin/add-banner', async (req, res) => {
    const { imageUrl, displayTime } = req.body;
    const banner = new Banner({ imageUrl, displayTime });
    await banner.save();
    res.status(201).json(banner);
});

app.delete('/admin/delete-banner/:id', async (req, res) => {
    await Banner.findByIdAndDelete(req.params.id);
    res.json({ message: "Banner deleted" });
});

app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server on port ${PORT}`));
