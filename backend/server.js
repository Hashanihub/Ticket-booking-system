const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables first
dotenv.config();

// Initialize Express app first
const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:8081', 'exp://your-ip:8081'], // frontend URLs
  credentials: true
}));
app.use(express.json());

// Then import database functions
const { testConnection, initDatabaseTables } = require('./config/database');

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));
app.use('/api/bookings', require('./routes/bookings'));

// 🔥 NEW: Database creation route (add this)
app.post('/api/database/create', async (req, res) => {
  try {
    const mysql = require('mysql2/promise');
    
    // First connect without database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306
    });
    
    // Create database if not exists
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'event_booking'}`);
    console.log('✅ Database created/verified:', process.env.DB_NAME || 'event_booking');
    
    await connection.end();
    
    // Now initialize tables
    await initDatabaseTables();
    
    res.json({ 
      success: true, 
      message: 'Database and tables created successfully!' 
    });
    
  } catch (error) {
    console.error('❌ Database creation failed:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Database creation failed',
      error: error.message 
    });
  }
});

// NEW: Reset database route (optional)
app.post('/api/database/reset', async (req, res) => {
  try {
    const mysql = require('mysql2/promise');
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306
    });
    
    // Drop and recreate database
    await connection.execute(`DROP DATABASE IF EXISTS ${process.env.DB_NAME || 'event_booking'}`);
    await connection.execute(`CREATE DATABASE ${process.env.DB_NAME || 'event_booking'}`);
    console.log('✅ Database reset completed');
    
    await connection.end();
    
    // Reinitialize tables
    await initDatabaseTables();
    
    res.json({ 
      success: true, 
      message: 'Database reset successfully!' 
    });
    
  } catch (error) {
    console.error('❌ Database reset failed:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Database reset failed',
      error: error.message 
    });
  }
});

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
    
    // UPDATED: Auto-create database on startup
    try {
      const mysql = require('mysql2/promise');
      const tempConnection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        port: process.env.DB_PORT || 3306
      });
      
      await tempConnection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'event_booking'}`);
      await tempConnection.end();
      console.log('✅ Database verified:', process.env.DB_NAME || 'event_booking');
    } catch (dbError) {
      console.log('⚠️ Database creation skipped:', dbError.message);
    }
    
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
      console.log(`🗄️  Database create: POST http://localhost:${PORT}/api/database/create`);
      console.log(`🔄 Database reset: POST http://localhost:${PORT}/api/database/reset`);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    console.log('💡 Try:');
    console.log('   1. Check XAMPP MySQL is running');
    console.log('   2. Verify database credentials in .env file');
    console.log('   3. Run: POST http://localhost:5001/api/database/create');
    process.exit(1);
  }
};

startServer();