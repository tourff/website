const express = require('express');
const router = express.Router();

// Sample Admin Route
router.get('/', (req, res) => {
    res.json({ message: "Welcome to Admin Dashboard" });
});

// Ei line-ti oboshoyoi thakte hobe
module.exports = router;
