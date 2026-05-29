const express = require('express');
const router = express.Router();
const {
  submitBookingForm,
  getTripInfo,
  getAllBookings,
  getBookingById,
  getBookingPublic,
  confirmBooking,
  updateBooking,
  deleteBooking,
  createBooking,
  getAllTrips,
  createTrip,
  updateTrip,
  deleteTrip,
  searchByPhone,
  confirmPayment,
  updateBookingUpi
} = require('../controllers/bookingController');
const { protectAny } = require('../middleware/auth');
const { validate, createBookingSchema } = require('../validators');

// ── PUBLIC (Client Form) ──
router.get('/trip-info/:tripCode', getTripInfo);
router.post('/submit/:tripCode', submitBookingForm);
router.get('/my-bookings/search', searchByPhone);
router.get('/lookup/:bookingId', getBookingPublic);

// ── ADMIN: Trip Management ──
router.get('/trips', protectAny, getAllTrips);
router.post('/trips', protectAny, createTrip);
router.put('/trips/:id', protectAny, updateTrip);
router.delete('/trips/:id', protectAny, deleteTrip);

// ── ADMIN: Booking Management ──
router.get('/', protectAny, getAllBookings);
// PUBLIC: customer booking submissions (tokenized booking links are validated in controller)
router.post('/', validate(createBookingSchema), createBooking);
router.post('/create', validate(createBookingSchema), createBooking);
router.get('/:id', protectAny, getBookingById);
router.put('/:id/confirm', protectAny, confirmBooking);
router.put('/:id', protectAny, updateBooking);
router.patch('/:id/confirm-payment', protectAny, confirmPayment);
router.patch('/:id', updateBookingUpi);
router.delete('/:id', protectAny, deleteBooking);

module.exports = router;
