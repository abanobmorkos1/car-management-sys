const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const connectDB = require('./Config/db');

// Routes
const authRoute = require('./Routes/auth');
const leaseRoutes = require('./Routes/lease');
const generateURLRoutes = require('./Routes/generateURL');
const newCarRoutes = require('./Routes/car'); 
const deliveryRoutes = require('./Routes/deliveries');
const codRoutes = require('./Routes/cod');
const salesRoutes = require('./Routes/sales');
const userRoutes = require('./Routes/user');

dotenv.config();
connectDB();

const app = express();

//  Confirm .env loaded
console.log('✅ FE Origin:', process.env.FE);

// Setup CORS with environment values
const allowedOrigins = [process.env.FE];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('❌ Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // for preflight

// ✅ Middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// ✅ Routes
app.use('/api/auth', authRoute);
app.use('/lease', leaseRoutes);
app.use('/upload', generateURLRoutes);
app.use('/car', newCarRoutes);
app.use('/sales', salesRoutes);
app.use('/delivery', deliveryRoutes);
app.use('/cod', codRoutes);
app.use('/api/users', userRoutes);



// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// git log -1 --pretty=%B 