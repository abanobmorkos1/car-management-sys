require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const connectDB = require('./Config/db');
const driverRoutes = require('./Routes/driver');
const app = express();

// Routes
const authRoute = require('./Routes/auth');
const leaseRoutes = require('./Routes/lease');
const generateURLRoutes = require('./Routes/generateURL');
const newCarRoutes = require('./Routes/car'); 
const deliveryRoutes = require('./Routes/deliveries');
const codRoutes = require('./Routes/cod');
const salesRoutes = require('./Routes/sales');
const userRoutes = require('./Routes/user');
const getImageUrlRoute = require('./Routes/generateURL');



connectDB();


//  Confirm .env loaded
// console.log('✅ FE Origin:', process.env.FE);

// Setup CORS with environment values

const allowedOrigins = [
  'http://localhost:3000', // your React dev server
  'https://car-management-sys-fe.vercel.app', 
  'https://car-management-sys-gvd2beueg-abanobmorkos1s-projects.vercel.app'// your Vercel frontend 
];

const corsOptions = {
  origin: function (origin, callback) {
    console.log(' Incoming origin:', origin);
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.warn(' Blocked by CORS:', origin);
    return callback(new Error('CORS not allowed'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // for preflight

// Middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
//  Routes
app.use('/api', getImageUrlRoute);
app.use('/api/auth', authRoute);
app.use('/lease', leaseRoutes);
app.use('/car', newCarRoutes);
app.use('/sales', salesRoutes);
app.use('/delivery', deliveryRoutes);
app.use('/cod', codRoutes);
app.use('/api/users', userRoutes);
app.use('/api/driver', driverRoutes)



//  server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));

// git log -1 --pretty=%B 