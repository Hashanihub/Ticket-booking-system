// Use a helper function to get the pool to avoid circular dependencies
const getPool = () => {
  return require('../config/database').pool;
};

class Event {
  // Create a new event
  static async create(eventData) {
    const pool = getPool();
    const {
      name, description, date, time, location, venue, image = '🎭',
      ticketPrice, availableTickets, category = 'other', organizerId
    } = eventData;

    const [result] = await pool.execute(
      `INSERT INTO events 
       (name, description, date, time, location, venue, image, 
        ticket_price_regular, ticket_price_vip, 
        available_tickets_regular, available_tickets_vip, 
        category, organizer_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, description, date, time, location, venue, image,
        ticketPrice.regular, ticketPrice.vip,
        availableTickets?.regular || 100, availableTickets?.vip || 50,
        category, organizerId
      ]
    );

    return this.findById(result.insertId);
  }

  // Find event by ID
  static async findById(id) {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT e.*, u.name as organizer_name, u.email as organizer_email 
       FROM events e 
       LEFT JOIN users u ON e.organizer_id = u.id 
       WHERE e.id = ? AND e.is_active = true`,
      [id]
    );
    return rows[0] || null;
  }

  // Find all events with pagination
  static async findAll(limit = 10, offset = 0) {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT e.*, u.name as organizer_name, u.email as organizer_email 
       FROM events e 
       LEFT JOIN users u ON e.organizer_id = u.id 
       WHERE e.is_active = true 
       ORDER BY e.date ASC 
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    return rows;
  }

  // Update event
  static async update(id, updateData) {
    const pool = getPool();
    const allowedFields = [
      'name', 'description', 'date', 'time', 'location', 'venue', 'image',
      'ticket_price_regular', 'ticket_price_vip', 
      'available_tickets_regular', 'available_tickets_vip', 'category'
    ];
    
    const fieldsToUpdate = {};
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        fieldsToUpdate[field] = updateData[field];
      }
    });

    if (Object.keys(fieldsToUpdate).length === 0) {
      return this.findById(id);
    }

    const setClause = Object.keys(fieldsToUpdate).map(field => `${field} = ?`).join(', ');
    const values = [...Object.values(fieldsToUpdate), id];

    await pool.execute(
      `UPDATE events SET ${setClause} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  // Soft delete event
  static async delete(id) {
    const pool = getPool();
    await pool.execute(
      'UPDATE events SET is_active = false WHERE id = ?',
      [id]
    );
    return true;
  }

  // Count total events
  static async count() {
    const pool = getPool();
    const [rows] = await pool.execute('SELECT COUNT(*) as total FROM events WHERE is_active = true');
    return rows[0].total;
  }

  // Update available tickets
  static async updateTickets(eventId, ticketType, quantity) {
    const pool = getPool();
    const field = `available_tickets_${ticketType}`;
    await pool.execute(
      `UPDATE events SET ${field} = ${field} - ? WHERE id = ?`,
      [quantity, eventId]
    );
  }
}

module.exports = Event;