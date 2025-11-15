require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 5050;

// Add basic error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
}).on('error', (err) => {
  console.error('Server failed to start:', err);
  process.exit(1);
});
