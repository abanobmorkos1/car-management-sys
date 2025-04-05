const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const connectDB = require('./Config/db');
const leaseRoutes = require('./Routes/lease');
const getLeasereturn = require('./Routes/lease');
const  deleteLr = require('./Routes/lease');
const  updateLr = require('./Routes/lease')
const salesRoutes = require('./Routes/sales')
dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(morgan('dev'));
app.use(bodyParser.json());

// Lease return routes
app.use('/lease', leaseRoutes);
app.use('/lease', getLeasereturn);
app.use('/lease',deleteLr )
app.use('/lease', updateLr)


// New Car 


// Sales Routes
app.use('/sales', salesRoutes);



app.get('/', (req, res) => {
  res.send('Welcome to the Lease Management API!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
