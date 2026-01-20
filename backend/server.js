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

// ১. প্রোডাক্ট মডেল (oldPrice ফিল্ড যুক্ত করা হয়েছে)
const Product = mongoose.model('Product', new mongoose.Schema({
    name: String, 
    price: Number, 
    oldPrice: Number, // ডিসকাউন্ট দেখানোর জন্য আগের দাম
    image: String, 
    inStock: { type: Boolean, default: true }
}));

// ২. ব্যানার মডেল
const Banner = mongoose.model('Banner', new mongoose.Schema({
    imageUrl: { type: String, required: true },
    displayTime: { type: Number, default: 5000 }
}));

// --- রুটসমূহ ---

// ১. প্রোডাক্ট রুটসমূহ
app.get('/products', async (req, res) => {
    const products = await Product.find();
    res.json(products);
});

app.post('/admin/add-product', async (req, res) => {
    const { name, price, oldPrice, image } = req.body;
    const product = new Product({ name, price, oldPrice, image }); // oldPrice সহ সেভ হবে
    await product.save();
    res.status(201).json(product);
});

// ৩. প্রোডাক্ট এডিট করার নতুন রুট (PUT Method)
app.put('/admin/edit-product/:id', async (req, res) => {
    try {
        const { name, price, oldPrice, image } = req.body;
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id, 
            { name, price, oldPrice, image }, 
            { new: true }
        );
        res.json(updatedProduct);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
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

// ২. ব্যানার রুটসমূহ
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
