const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const authRoutes = require('./routes/auth');
const hotelRoutes = require('./routes/hotelRoutes');
const userRoutes = require('./routes/userRoutes');
const itemRoutes = require('./routes/itemRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const storeStockRoutes = require('./routes/storeStockRoutes');
const stockIssueRoutes = require('./routes/stockIssueRoutes');
const procurementRoutes = require('./routes/procurementRoutes');
const procurementOrderRoutes = require('./routes/procurementOrderRoutes');
const paymentsRoutes = require('./routes/paymentsRoutes');
const mdDashboardRoutes = require('./routes/mdDashboardRoutes');
const consumptionRoutes = require('./routes/consumptionRoutes');
const salesRoutes = require('./routes/salesRoutes');
const reportsRoutes = require('./routes/reportsRoutes');

const app = express();

// Trust proxy for production deployments
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? (process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : ['http://localhost:3000'])
    : true,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/auth', authRoutes);
app.use('/hotels', hotelRoutes);
app.use('/users', userRoutes);
app.use('/items', itemRoutes);
app.use('/vendors', vendorRoutes);
app.use('/recipes', recipeRoutes);
app.use('/store', storeStockRoutes);
app.use('/store', stockIssueRoutes);
app.use('/procurement', procurementRoutes);
app.use('/procurement-orders', procurementOrderRoutes);
app.use('/payments', paymentsRoutes);
app.use('/md-dashboard', mdDashboardRoutes);
app.use('/consumption', consumptionRoutes);
app.use('/sales', salesRoutes);
app.use('/reports', reportsRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('Backend is running');
});

// Connect to MongoDB
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/restaurant_erp';
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

module.exports = app;
