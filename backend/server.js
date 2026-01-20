const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs'); // পাসওয়ার্ড লুকানোর জন্য
const jwt = require('jsonwebtoken'); // সিকিউর লগইনের জন্য
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const SECRET_KEY = "turjo_site_super_secret_key"; // এটি আপনার সিক্রেট পাসওয়ার্ড

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ MongoDB Error:", err));

// ইউজার মডেল
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

// রেজিস্ট্রেশন রুট
app.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10); // পাসওয়ার্ড হ্যাস করা
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: "Registration Successful!" });
    } catch (err) {
        res.status(400).json({ message: "User already exists or error occurred!" });
    }
});

// লগইন রুট
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found!" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Wrong Password!" });

        const token = jwt.sign({ id: user._id, username: user.username }, SECRET_KEY, { expiresIn: '1d' });
        res.json({ message: "Welcome!", token, username: user.username });
    } catch (err) {
        res.status(500).json({ message: "Server error!" });
    }
});

// (আগের প্রোডাক্ট রুটগুলো এখানে থাকবে...)
app.listen(8080, '0.0.0.0', () => console.log(`🚀 Server live on 8080`));
