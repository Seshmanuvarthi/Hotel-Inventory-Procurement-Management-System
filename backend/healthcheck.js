const mongoose = require('mongoose');

const healthCheck = async () => {
  try {
    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      console.error('MongoDB not connected');
      process.exit(1);
    }

    // Check if we can perform a simple database operation
    const db = mongoose.connection.db;
    await db.admin().ping();

    console.log('Health check passed');
    process.exit(0);
  } catch (error) {
    console.error('Health check failed:', error);
    process.exit(1);
  }
};

healthCheck();
