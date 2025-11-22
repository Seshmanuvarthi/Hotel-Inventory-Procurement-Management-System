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
const restaurantStockRequestRoutes = require('./routes/restaurantStockRequestRoutes');
const paymentsRoutes = require('./routes/paymentsRoutes');
const mdDashboardRoutes = require('./routes/mdDashboardRoutes');
const consumptionRoutes = require('./routes/consumptionRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reportsRoutes = require('./routes/reportsRoutes');
const leakageAlertRoutes = require('./routes/leakageAlertRoutes');
const outwardMaterialRoutes = require('./routes/outwardMaterialRoutes');

// Initialize Cloudinary configuration
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Cloudinary configuration will be handled in controllers that need it

const app = express();

// Trust proxy for production deployments
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'https://hotel-inventory-procurement-management-sr7u.onrender.com',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:3001', // In case React runs on alternative port
      'http://127.0.0.1:3001'
    ];

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
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
app.use('/restaurant-stock-requests', restaurantStockRequestRoutes);
app.use('/outward-material-requests', outwardMaterialRoutes);
app.use('/payments', paymentsRoutes);
app.use('/md-dashboard', mdDashboardRoutes);
app.use('/consumption', consumptionRoutes);
app.use('/orders', orderRoutes);
app.use('/reports', reportsRoutes);
app.use('/leakage-alerts', leakageAlertRoutes);

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
