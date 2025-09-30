import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

// POST /api/users/register - Register new user
router.post('/register', async (req, res) => {
    try {
      const { name, email, password } = req.body;
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ message: 'User already exists' });
  
      const user = new User({ name, email, password });
      await user.save();
  
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
      res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: 'Invalid credentials' });
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
  
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
      res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
  export default router;