const express = require('express');
const router = express.Router();
const {
  getAllBookings,
  checkAvailability,
  createBooking,
  startSessionFromBooking,
  cancelBooking,
} = require('../controllers/booking.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.get('/get-all-bookings', verifyToken, getAllBookings);
router.post('/check-availability', checkAvailability);
router.post('/create', verifyToken, createBooking);
router.post('/start-session/:bookingId', verifyToken, startSessionFromBooking);
router.put('/cancel/:bookingId', verifyToken, cancelBooking);

module.exports = router;
