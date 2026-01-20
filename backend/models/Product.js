const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  inStock: { type: Boolean, default: true } // নতুন যোগ করা হয়েছে
});

module.exports = mongoose.model('Product', ProductSchema);
