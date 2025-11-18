const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant_management', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
  const RestaurantStockRequest = require('./src/models/RestaurantStockRequest');
  
  return RestaurantStockRequest.findById('691c3ded6a6da3ccce017560').populate('restaurantId');
}).then(request => {
  if (!request) {
    console.log('Request not found');
    process.exit(1);
  }
  console.log('Request found:', request._id);
  console.log('Restaurant ID:', request.restaurantId);
  console.log('Restaurant name:', request.restaurantId ? request.restaurantId.name : 'No restaurant');
  console.log('Overall Status:', request.overallStatus);
  console.log('Items:', request.items.map(item => ({
    itemId: item.itemId,
    requested: item.requestedQuantity,
    issued: item.issuedQuantity,
    status: item.status
  })));
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
