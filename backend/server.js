const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables first
dotenv.config();

// Initialize Express app first
const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:8081', 'exp://your-ip:8081'], // Add your frontend URLs
  credentials: true
}));
app.use(express.json());

// Then import database functions
const { testConnection, initDatabaseTables } = require('./config/database');

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));
app.use('/api/bookings', require('./routes/bookings'));

// Test route
app.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: '🎉 Event Booking API with MySQL is running...',
    database: 'MySQL',
    timestamp: new Date().toISOString()
  });
});

// Health check route
app.get('/health', async (req, res) => {
  try {
    const dbStatus = await testConnection();
    res.json({ 
      success: true,
      status: 'OK',
      database: dbStatus ? 'Connected' : 'Disconnected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.json({ 
      success: false,
      status: 'Error',
      database: 'Disconnected',
      error: error.message
    });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
const startServer = async () => {
  try {
    console.log('🔄 Starting server initialization...');
    
    const dbConnected = await testConnection();
    if (!dbConnected) throw new Error('Failed to connect to database');
    
    await initDatabaseTables();
    
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => {
      console.log('🚀 Server started successfully!');
      console.log(`📍 Port: ${PORT}`);
      console.log(`📊 Database: MySQL`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 API URL: http://localhost:${PORT}`);
      console.log(`❤️  Health check: http://localhost:${PORT}/health`);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();