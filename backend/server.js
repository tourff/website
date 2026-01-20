const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB কানেকশন
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ Connection Failed:', err));

const productSchema = new mongoose.Schema({
    name: String, price: Number, oldPrice: Number, 
    image: String, description: String, inStock: { type: Boolean, default: true }
});
const Product = mongoose.model('Product', productSchema);

// এই গেট রুটটি আপনার ৫০০ এরর দূর করবে
app.get('/products', async (req, res) => {
    try {
        const products = await Product.find() || [];
        res.status(200).json(products); 
    } catch (err) {
        console.error("Fetch Error:", err);
        res.status(500).json([]); // এরর হলেও ফ্রন্টএন্ডে খালি অ্যারে পাঠাবে
    }
});

app.post('/admin/add-product', async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.status(201).json({ message: "Product published!" });
    } catch (err) {
        res.status(400).json({ message: "Publish failed" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running`));
