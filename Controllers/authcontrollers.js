const User = require('../Schema/user');
const bcrypt = require('bcryptjs');

// Register
const registerUser = async (req, res) => {
  const { name, email, password, role, inviteCode, phoneNumber } = req.body;

  if (!name || !email || !password || !role || !inviteCode || !phoneNumber) {
    return res.status(400).json({ message: 'Please fill in all required fields' });
  }

  if (inviteCode !== process.env.INVITE_CODE) {
    return res.status(403).json({ message: 'Invalid invite code' });
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashedPassword, role, phoneNumber });

  res.status(201).json({ message: 'User registered successfully', user });
};

// Login
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  // ✅ Store user info in session
  req.session.user = {
    id: user._id,
    name: user.name,
    role: user.role,
  };


  res.json({ message: 'Logged in successfully', user: req.session.user });
};

// Logout
const logout = async (req, res) => {
  if (req.session) {
    req.session.destroy(err => {
      if (err) {
        console.error('❌ Error destroying session:', err);
        return res.status(500).json({ message: 'Could not log out' });
      }
      res.clearCookie('connect.sid');
      res.json({ message: 'Logged out successfully' });
    });
  } else {
    res.status(200).json({ message: 'Already logged out' });
  }
};

// Check session (for frontend use)
const checkSession = (req, res) => {
  if (req.session?.user) {
    const { id, name, role } = req.session.user;

    return res.json({
      user: {
        _id: id,      // ✅ This is the fix
        name,
        role
      }
    });
  }

  res.status(401).json({ message: 'Not authenticated' });
};

// Get Drivers
const getDrivers = async (req, res) => {
  try {
    const drivers = await User.find({ role: 'Driver' }).select('_id name');
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch drivers' });
  }
};

const refreshToken = async (req, res) => {
  if (!req.session?.user) {
    return res.status(401).json({ message: 'No session found' });
  }

  // Optional: log it for debugging
  console.log('🔁 Session refresh requested for:', req.session.user);

  const user = await User.findById(req.session.user.id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Create new short-lived access token (optional if you want JWT)
  const accessToken = {
    id: user._id,
    name: user.name,
    role: user.role
  };

  return res.json({ accessToken });
};

module.exports = {
  registerUser,
  loginUser,
  logout,
  getDrivers,
  checkSession,
  refreshToken
};
