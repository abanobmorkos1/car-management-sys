const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../Schema/user');
require('dotenv').config();

router.post('/register', async (req, res) => {
  console.log('🟢 REGISTER ROUTE HIT');

  const { name, email, password, role, inviteCode } = req.body;

  if (inviteCode !== process.env.INVITE_CODE) {
    return res.status(403).json({ message: 'Invalid invite code' });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);
    console.log('🔐 Hashed password being saved:', hashed); // ✅ this confirms it
    const user = await User.create({ name, email, password: hashed, role });

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Registration error', error: err.message });
  }
});


router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('📩 Login payload:', { email, password });

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found');
      return res.status(401).json({ message: 'User not found' });
    }

    console.log('👤 User found:', user.email);
    console.log('🔒 Stored password:', user.password);

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('✅ Password match?', isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('🎫 Token issued for:', user.email);
    res.status(200).json({ token, role: user.role });
  } catch (error) {
    console.error('🔥 Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});


module.exports = router;