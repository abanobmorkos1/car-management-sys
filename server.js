require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const connectDB = require('./Config/db');
const driverRoutes = require('./Routes/driver');

const app = express();

// 🧠 Connect to MongoDB
connectDB();

// ✅ Trust Render's proxy for secure cookies
app.set('trust proxy', 1);

const allowedOrigins = [
  'http://localhost:3000',
  'https://app.vipautoapp.com',
  'https://car-management-sys.onrender.com',
  // Add any preview links if needed
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.error(`❌ Blocked by CORS: ${origin}`);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// ✅ Middleware
app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Session Setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'mysecret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions',
  }),
  cookie: {
    domain: process.env.COOKIE_DOMAIN || undefined, // e.g. .vipautoapp.com in production
    sameSite: 'Lax',
    secure: true,
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  }
}));

// 🛑 Prevent caching for auth session route
app.use('/api/auth/sessions', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

// 🔗 Routes
app.use('/api', require('./Routes/generateURL'));
app.use('/api/auth', require('./Routes/auth'));
app.use('/lease', require('./Routes/lease'));
app.use('/sales', require('./Routes/sales'));
app.use('/api/car', require('./Routes/car'));
app.use('/api/delivery', require('./Routes/deliveries'));
app.use('/cod', require('./Routes/cod'));
app.use('/api/users', require('./Routes/user'));
app.use('/api/driver', driverRoutes);
app.use('/api/s3', require('./Routes/s3'));
app.use('/api/hours/driver', require('./Routes/driverHoursRoutes'));
app.use('/api/hours/manager-owner', require('./Routes/managerHoursRoutes'));

// 🔍 Debug Session Route
app.get('/api/debug-session', (req, res) => {
  console.log('🧪 Session content:', req.session);
  res.json({ session: req.session });
});

// 🚀 Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
