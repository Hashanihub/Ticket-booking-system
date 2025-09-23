const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const { protect } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Create booking
router.post('/', [
  protect,
  body('eventId').isInt().withMessage('Valid event ID is required'),
  body('tickets').isArray().withMessage('Tickets array is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { eventId, tickets } = req.body;

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Calculate total amount
    let totalAmount = 0;
    for (const ticket of tickets) {
      const priceField = `ticket_price_${ticket.type}`;
      totalAmount += event[priceField] * ticket.quantity;
    }

    const bookingData = {
      userId: req.user.id,
      eventId,
      tickets,
      totalAmount
    };

    const booking = await Booking.create(bookingData);

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating booking'
    });
  }
});

// Get user bookings
router.get('/my-bookings', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const bookings = await Booking.findByUserId(req.user.id, limit, offset);
    const totalBookings = await Booking.count(req.user.id);

    res.json({
      success: true,
      data: bookings,
      pagination: {
        page,
        limit,
        total: totalBookings,
        pages: Math.ceil(totalBookings / limit)
      }
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings'
    });
  }
});

module.exports = router;