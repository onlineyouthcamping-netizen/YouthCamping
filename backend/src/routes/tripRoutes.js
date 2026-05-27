const express = require('express');
const router = express.Router();
console.log("✅ [Routes] Loading tripRoutes.js");
const {
  getTrips,
  getTrip,
  getTripBySlug,
  createTrip,
  updateTrip,
  deleteTrip,
  shuffleTrips,
  bulkUpdateTripOrder,
  seedLiveData
} = require('../controllers/tripController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/', getTrips);
router.get('/seed/live-data', seedLiveData);
router.get('/slug/:slug', getTripBySlug);
router.get('/:id', getTrip);

// Admin routes
const authorize = require('../middleware/role');
router.post('/', protect, authorize('admin', 'manager'), createTrip);
router.post('/shuffle', protect, authorize('admin', 'manager'), shuffleTrips);
router.post('/bulk-order', protect, authorize('admin', 'manager'), bulkUpdateTripOrder);
router.put('/:id', protect, authorize('admin', 'manager'), updateTrip);
router.delete('/:id', protect, authorize('admin', 'manager'), deleteTrip);

module.exports = router;
