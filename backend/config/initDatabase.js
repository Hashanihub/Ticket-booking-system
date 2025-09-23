const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const initDatabase = async () => {
  try {
    console.log('🔄 Starting database initialization...');
    
    // First, create database if it doesn't exist
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });

    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log(`✅ Database '${process.env.DB_NAME}' created or already exists`);
    
    await connection.end();

    // Now connect to the specific database and create tables
    const dbConnection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('🔄 Creating database tables...');

    // Users table
    await dbConnection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        role ENUM('user', 'admin') DEFAULT 'user',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Events table
    await dbConnection.execute(`
      CREATE TABLE IF NOT EXISTS events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        date DATE NOT NULL,
        time TIME NOT NULL,
        location VARCHAR(200) NOT NULL,
        venue VARCHAR(100) NOT NULL,
        image VARCHAR(255) DEFAULT '🎭',
        ticket_price_regular DECIMAL(10,2) NOT NULL,
        ticket_price_vip DECIMAL(10,2) NOT NULL,
        available_tickets_regular INT DEFAULT 100,
        available_tickets_vip INT DEFAULT 50,
        category ENUM('music', 'sports', 'conference', 'theater', 'festival', 'other') DEFAULT 'other',
        organizer_id INT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (organizer_id) REFERENCES users(id)
      )
    `);

    // Bookings table
    await dbConnection.execute(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        event_id INT NOT NULL,
        tickets JSON NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'confirmed',
        payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'paid',
        qr_code VARCHAR(100) UNIQUE,
        booking_reference VARCHAR(50) UNIQUE,
        notes TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (event_id) REFERENCES events(id)
      )
    `);

    console.log('✅ Database tables created successfully!');

    // Create default admin user
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const [existingAdmin] = await dbConnection.execute(
      'SELECT id FROM users WHERE email = ?', 
      ['admin@eventbook.com']
    );

    if (existingAdmin.length === 0) {
      await dbConnection.execute(
        `INSERT INTO users (name, email, password, phone, role) 
         VALUES (?, ?, ?, ?, ?)`,
        ['System Administrator', 'admin@eventbook.com', hashedPassword, '+1234567890', 'admin']
      );
      console.log('✅ Default admin user created: admin@eventbook.com / admin123');
    } else {
      console.log('✅ Admin user already exists');
    }

    await dbConnection.end();
    
    console.log('🎉 Database setup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  }
};

// Only run if this file is executed directly
if (require.main === module) {
  initDatabase();
}

module.exports = { initDatabase };