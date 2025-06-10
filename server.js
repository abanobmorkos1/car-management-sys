require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const connectDB = require('./Config/db');
const helmet = require('helmet'); // ✅ Added
require('./Utils/faker');
const app = express();

// 🧠 Connect to MongoDB
connectDB();

// ✅ Trust Render's proxy for secure cookies
app.set('trust proxy', 1);

// ✅ Middleware
app.use(morgan('dev'));
app.use(cookieParser());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(helmet());
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));

// ✅ Trust localhost (not needed, but harmless)
app.set('trust proxy', 1);

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'mysecret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: 'sessions',
    }),
    cookie: {
      domain:
        process.env.NODE_ENV === 'production'
          ? process.env.COOKIE_DOMAIN
          : undefined,
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);

// 🛑 No caching for auth
app.use('/api/auth/sessions', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

// 🔗 Routes
app.use('/api/auth', require('./Routes/auth'));
app.use('/lease', require('./Routes/lease'));
app.use('/sales', require('./Routes/sales'));
app.use('/api/car', require('./Routes/car'));
app.use('/api/delivery', require('./Routes/deliveries'));
app.use('/cod', require('./Routes/cod'));
app.use('/api/users', require('./Routes/user'));
app.use('/api/driver', require('./Routes/driver'));
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
app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);
