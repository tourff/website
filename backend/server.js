
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Import Routes
const productRoutes = require('./routes/products');
const adminRoutes = require('./routes/admin');

// Routes Middleware
app.use('/products', productRoutes);
app.use('/admin', adminRoutes);

// Root Route (for testing)
app.get('/', (req, res) => {
    res.send("Server is running...");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
