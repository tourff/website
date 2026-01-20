const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;
const mongoURI = process.env.MONGO_URI;

app.get('/', (req, res) => {
    res.status(200).send('Turjo Site Backend is Active!');
});

if (mongoURI) {
    mongoose.connect(mongoURI)
    .then(() => console.log("✅ MongoDB Connected Successfully!"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));
}

// স্কিমা আপডেট: description এবং customDiscount যোগ করা হয়েছে
const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    oldPrice: Number, 
    image: String,
    description: String,
    customDiscount: String
});
const Product = mongoose.model('Product', productSchema);

app.get('/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/admin/add-product', async (req, res) => {
    const { name, price, oldPrice, image, description, customDiscount } = req.body;
    const product = new Product({ name, price, oldPrice, image, description, customDiscount });
    try {
        const newProduct = await product.save();
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is live on port ${PORT}`);
});
