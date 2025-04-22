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
// Sales Routes
const salesRoutes = require('./Routes/sales')
// Generate URL Routes
const generateURLRoutes = require('./Routes/generateURL');
// New Car Routes
const newCarRoutes = require('./Routes/car'); 
// Delivery Routes
const deliveryRoutes = require('./Routes/deliveries');
// cod routes
const codRoutes = require('./Routes/cod');

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(morgan('dev'));
app.use(bodyParser.json());


const allowedOrigins = [
  'http://localhost:3000',
  'https://car-management-sys.onrender.com',
];

app.use(cors({
  origin: allowedOrigins, // Replace with your frontend URL
  credentials: true, // Allow cookies to be sent
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
app.use('/newdelivery', deliveryRoutes);
// COD Routes
app.use('/cod', codRoutes);
// auth Routes
app.use('/api/auth', authRoute);

app.get('/', (req, res) => {
  res.send('Welcome to the Lease Management API!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// git log -1 --pretty=%B 