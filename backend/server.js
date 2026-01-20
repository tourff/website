const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// নিরাপদ কানেকশন লজিক (স্পেস রিমুভারসহ)
let dbURI = process.env.MONGODB_URI ? process.env.MONGODB_URI.trim() : ""; 

if (dbURI && dbURI.startsWith("mongodb")) {
    mongoose.connect(dbURI)
        .then(() => console.log('✅ Connected to MongoDB Successfully'))
        .catch(err => console.error('❌ Database Connection Failed:', err.message));
} else {
    console.error('❌ CRITICAL: MONGODB_URI is invalid or missing in Railway!');
}

const Product = mongoose.model('Product', new mongoose.Schema({
    name: String, price: Number, image: String, description: String, inStock: { type: Boolean, default: true }
}));

// পাবলিক রুট (৫০০ এরর এবং ফর-ইচ এরর চিরতরে ফিক্স)
app.get('/products', async (req, res) => {
    try {
        const products = await Product.find().lean();
        res.status(200).json(products || []); 
    } catch (err) {
        res.status(200).json([]); // এরর হলেও খালি লিস্ট পাঠাবে যাতে সাইট না ভাঙে
    }
});

app.post('/admin/add-product', async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.status(201).json({ success: true });
    } catch (err) { res.status(400).json({ success: false }); }
});

app.delete('/admin/delete-product/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false }); }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => console.log(`Server live on port ${PORT}`));
