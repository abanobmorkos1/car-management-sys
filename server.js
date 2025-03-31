const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');
const morgan = require('morgan'); // For logging requests in development mode
const bodyParser = require('body-parser');
const connectDB = require('./Config/db'); // Make sure to create this file to connect to your MongoDB database
const leaseReturns=require('./Routes/lease'); // Assuming you have a lease.js file in your Routes folder for handling lease return routes
dotenv.config();
connectDB();
const app = express();

//Midlleware
app.use(express.json());
app.use(morgan('dev'));
app.use(express.json());
app.use(bodyParser.json())


app.use('/newleasereturn', leaseReturns); // Use the lease return routes for any requests to /newleasereturn

app.get('/', (req, res) => {
  res.send('Welcome to the Lease Management API!');
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
