const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const connectDB = require('./Config/db');
const leaseRoutes = require('./Routes/lease');
const salesRoutes = require('./Routes/sales')
const generateURLRoutes = require('./Routes/generateURL');
const newCarRoutes = require('./Routes/car'); // Assuming you have a carRoutes file for handling car creation and uploads

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(morgan('dev'));
app.use(bodyParser.json());

// Lease return routes
app.use('/lease', leaseRoutes);
// 
app.use('/upload', generateURLRoutes)
// New Car 
app.use('/car', newCarRoutes); // Assuming you have a carRoutes file for handling car creation and uploads


// Sales Routes
app.use('/sales', salesRoutes);



app.get('/', (req, res) => {
  res.send('Welcome to the Lease Management API!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
