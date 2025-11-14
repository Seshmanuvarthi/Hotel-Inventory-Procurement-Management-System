const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const hotelRoutes = require('./routes/hotelRoutes');
const userRoutes = require('./routes/userRoutes');
const itemRoutes = require('./routes/itemRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const storeStockRoutes = require('./routes/storeStockRoutes');
const stockIssueRoutes = require('./routes/stockIssueRoutes');
const procurementRoutes = require('./routes/procurementRoutes');
const paymentsRoutes = require('./routes/paymentsRoutes');
const mdDashboardRoutes = require('./routes/mdDashboardRoutes');
const consumptionRoutes = require('./routes/consumptionRoutes');
const salesRoutes = require('./routes/salesRoutes');
const reportsRoutes = require('./routes/reportsRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/hotels', hotelRoutes);
app.use('/users', userRoutes);
app.use('/items', itemRoutes);
app.use('/recipes', recipeRoutes);
app.use('/store', storeStockRoutes);
app.use('/store', stockIssueRoutes);
app.use('/procurement', procurementRoutes);
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
.catch(err => console.log(err));

module.exports = app;
