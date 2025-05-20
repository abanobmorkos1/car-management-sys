const User = require('../Schema/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Register User

const registerUser = async (req, res) => {
  console.log('📥 Received body:', req.body)
  const { name, email, password, role, inviteCode , phoneNumber } = req.body;

  try {
    // Check if all required fields are provided
    if (!name ||!email || !password || !role || !inviteCode || !phoneNumber) {
      return res.status(400).json({ message: 'Please fill in all required fields' });
    }

    // Check if invite code matches
    if (!inviteCode || inviteCode !== process.env.INVITE_CODE) {
      console.log('❌ Invalid invite code:', inviteCode);
      return res.status(403).json({ message: 'Invalid invite code' });
    }
    

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      phoneNumber
    });

    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    console.error(error); // Always log errors for debugging
    res.status(500).json({ message: 'Server Error' });
  }
};




// Login User
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    console.log('➡️ Login attempt for:', email);
    if (!user) {
      console.log('❌ User not found');
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log('🧾 Stored password:', user.password);
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('🔐 Password match:', isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user._id, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ Token generated');
    res.status(200).json({ token, role: user.role , name: user.name});
  } catch (err) {
    console.error('🔥 Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getDrivers = async (req, res) => {
  try {
    const drivers = await User.find({ role: 'Driver' }).select('_id name');
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch drivers' });
  }
};

module.exports = { registerUser, loginUser , getDrivers };
