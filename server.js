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

// 🧠 MongoDB connection
connectDB();

// ✅ CORS before everything
const allowedOrigins = [
  'http://localhost:3000',
  'https://car-management-sys-fe.vercel.app',
  'https://car-management-sys-fe-git-main-abanobmorkos1s-projects.vercel.app',
  'https://car-management-sys-c0fgcut9j-abanobmorkos1s-projects.vercel.app',
  'https://car-management-sys.onrender.com'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.error(`❌ Blocked by CORS: ${origin}`);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// ✅ Middlewares
app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Session setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'mysecret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions',
  }),
  cookie: {
    httpOnly: true,
    secure: true,      // false in dev
    sameSite: 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000
  }
}));

// 🛑 Prevent caching ONLY for the auth check route
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
