const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection with Error Handling
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// Routes Import (Pala kore import kora secure)
const productRoutes = require('./routes/products');
const adminRoutes = require('./routes/admin');

app.use('/products', productRoutes);
app.use('/admin', adminRoutes);

// Base route for Railway health check
app.get('/', (req, res) => res.send("Backend is Live!"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
