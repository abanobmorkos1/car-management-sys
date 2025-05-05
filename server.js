const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const connectDB = require('./Config/db');
const authRoute = require('./Routes/auth');
const cors = require('cors')
//lease return routes
const leaseRoutes  = require('./Routes/lease');
// Generate URL Routes
const generateURLRoutes = require('./Routes/generateURL');
// New Car Routes
const newCarRoutes = require('./Routes/car'); 
// Delivery Routes
const deliveryRoutes = require('./Routes/deliveries');
// cod routes
const codRoutes = require('./Routes/cod');
// User Routes for sales collection
const salesRoutes = require('./Routes/sales');
// User Routes for sales collection
const userRoutes = require('./Routes/user');

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(morgan('dev'));
app.use(bodyParser.json());


const FE= process.env.FE
const BE= process.env.BE

const allowedOrigins = [
  FE,
  BE
];

app.use(cors({
  origin: allowedOrigins, 
  credentials: true, 
}));

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));


// Lease return routes
app.use('/lease', leaseRoutes);
// Generate URL Routes
app.use('/upload', generateURLRoutes)
// New Car 
app.use('/car', newCarRoutes); 
// Sales Routes
app.use('/sales', salesRoutes);
// Delivery Routes
app.use('/delivery', deliveryRoutes);
// COD Routes
app.use('/cod', codRoutes);
// auth Routes
app.use('/api/auth', authRoute);
// User Routes for sales collection
app.use('/api/users', userRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// git log -1 --pretty=%B 