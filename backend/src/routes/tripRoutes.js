const express = require('express');
const router = express.Router();
console.log("   [Routes] Loading tripRoutes.js");
const {
  getTrips,
  getPublicTripCards,
  getPublicTripDetail,
  getTrip,
  getTripBySlug,
  createTrip,
  updateTrip,
  deleteTrip,
  shuffleTrips,
  bulkUpdateTripOrder,
  seedLiveData,
  getTripDepartures
} = require('../controllers/tripController');
const { authenticate, requirePermission, enforceOwnership } = require('../middleware/auth');
const { stripFinancialFieldsForGuides } = require('../middleware/financialStripper');

// Public routes
router.get('/public/cards', getPublicTripCards);
router.get('/public/slug/:slug', getPublicTripDetail);

router.get('/', authenticate, stripFinancialFieldsForGuides, getTrips);

router.get('/seed/live-data', authenticate, seedLiveData);

router.get('/slug/:slug', authenticate, stripFinancialFieldsForGuides, getTripBySlug);

router.get('/:id/departures', authenticate, getTripDepartures);
router.get('/:id', authenticate, enforceOwnership('trip'), stripFinancialFieldsForGuides, getTrip);

// Admin routes
router.post('/', authenticate, requirePermission('trips.create'), createTrip);
router.post('/shuffle', authenticate, requirePermission('trips.edit'), shuffleTrips);
router.post('/bulk-order', authenticate, requirePermission('trips.edit'), bulkUpdateTripOrder);
router.put('/:id', authenticate, requirePermission('trips.edit'), enforceOwnership('trip'), updateTrip);
router.delete('/:id', authenticate, requirePermission('trips.delete'), enforceOwnership('trip'), deleteTrip);

module.exports = router;
