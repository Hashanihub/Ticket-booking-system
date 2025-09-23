// Use a helper function to get the pool to avoid circular dependencies
const getPool = () => {
  return require('../config/database').pool;
};

class Booking {
  // Create a new booking
  static async create(bookingData) {
    const pool = getPool();
    const { userId, eventId, tickets, totalAmount } = bookingData;
    
    const bookingReference = 'BK' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
    const qrCode = 'QR' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();

    const [result] = await pool.execute(
      `INSERT INTO bookings 
       (user_id, event_id, tickets, total_amount, booking_reference, qr_code) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, eventId, JSON.stringify(tickets), totalAmount, bookingReference, qrCode]
    );

    return this.findById(result.insertId);
  }

  // Find booking by ID
  static async findById(id) {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT b.*, u.name as user_name, u.email as user_email, 
              e.name as event_name, e.date as event_date, e.location as event_location 
       FROM bookings b 
       LEFT JOIN users u ON b.user_id = u.id 
       LEFT JOIN events e ON b.event_id = e.id 
       WHERE b.id = ?`,
      [id]
    );
    
    if (rows[0]) {
      rows[0].tickets = JSON.parse(rows[0].tickets);
    }
    
    return rows[0] || null;
  }

  // Find bookings by user ID
  static async findByUserId(userId, limit = 10, offset = 0) {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT b.*, e.name as event_name, e.date as event_date, e.location as event_location, e.image 
       FROM bookings b 
       LEFT JOIN events e ON b.event_id = e.id 
       WHERE b.user_id = ? 
       ORDER BY b.booking_date DESC 
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );
    
    return rows.map(row => ({
      ...row,
      tickets: JSON.parse(row.tickets)
    }));
  }

  // Find all bookings (admin only)
  static async findAll(limit = 10, offset = 0) {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT b.*, u.name as user_name, u.email as user_email, 
              e.name as event_name, e.date as event_date 
       FROM bookings b 
       LEFT JOIN users u ON b.user_id = u.id 
       LEFT JOIN events e ON b.event_id = e.id 
       ORDER BY b.booking_date DESC 
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    
    return rows.map(row => ({
      ...row,
      tickets: JSON.parse(row.tickets)
    }));
  }

  // Update booking status
  static async updateStatus(id, status) {
    const pool = getPool();
    await pool.execute(
      'UPDATE bookings SET status = ? WHERE id = ?',
      [status, id]
    );
    return this.findById(id);
  }

  // Count total bookings
  static async count(userId = null) {
    const pool = getPool();
    let query = 'SELECT COUNT(*) as total FROM bookings';
    const params = [];
    
    if (userId) {
      query += ' WHERE user_id = ?';
      params.push(userId);
    }
    
    const [rows] = await pool.execute(query, params);
    return rows[0].total;
  }
}

module.exports = Booking;