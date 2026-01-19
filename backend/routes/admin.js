
const router = require('express').Router();
const Product = require('../models/Product');

const ADMIN_PASSWORD = "admin123";

router.post('/login', (req, res) => {
  if (req.body.password === ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

router.post('/add-product', async (req, res) => {
  const product = new Product(req.body);
  await product.save();
  res.json({ success: true });
});

module.exports = router;
