const express = require('express');
const router = express.Router();
const {
  getVendors,
  createVendor,
  getDayItinerary,
  upsertDayItinerary,
  deleteDayItinerary,
  getTripExpenses,
  upsertTripExpense,
  deleteTripExpense,
  getHotelBookings,
  createHotelBooking,
  deleteHotelBooking,
  getTransportFleet,
  createTransportFleet,
  deleteTransportFleet,
  getRoomInventory,
  createRoomInventory,
  deleteRoomInventory,
  getGuidePayments,
  createGuidePayment,
  getOpsAccountingSummary,
  getSeatConfig,
  getChecklist,
  toggleChecklistItem,
  getIncidents,
  createIncident,
  generateAllocation,
  confirmAllocation,
  overrideAllocation
} = require('../controllers/opsController');
const { authenticate, requirePermission } = require('../middleware/auth');

router.use(authenticate);

// Directory
router.get('/vendors', requirePermission('ops.view'), getVendors);
router.post('/vendors', requirePermission('ops.manage'), createVendor);

// Excel Match Grids (Scoped by departureDate in query params)
router.get('/itinerary/:tripId', requirePermission('ops.view'), getDayItinerary);
router.post('/itinerary/:tripId', requirePermission('ops.manage'), upsertDayItinerary);
router.delete('/itinerary/:id', requirePermission('ops.manage'), deleteDayItinerary);
router.get('/expenses/:tripId', requirePermission('ops.view'), getTripExpenses);
router.post('/expenses/:tripId', requirePermission('ops.manage'), upsertTripExpense);
router.delete('/expenses/:id', requirePermission('ops.manage'), deleteTripExpense);

// Trackers
router.get('/hotels/:tripId', requirePermission('ops.view'), getHotelBookings);
router.post('/hotels/:tripId', requirePermission('ops.manage'), createHotelBooking);
router.delete('/hotels/:id', requirePermission('ops.manage'), deleteHotelBooking);
router.get('/transport/:tripId', requirePermission('ops.view'), getTransportFleet);
router.post('/transport/:tripId', requirePermission('ops.manage'), createTransportFleet);
router.delete('/transport/:id', requirePermission('ops.manage'), deleteTransportFleet);
router.get('/rooms/:tripId', requirePermission('ops.view'), getRoomInventory);
router.post('/rooms/:tripId', requirePermission('ops.manage'), createRoomInventory);
router.delete('/rooms/:id', requirePermission('ops.manage'), deleteRoomInventory);
router.get('/guides/:tripId', requirePermission('ops.view'), getGuidePayments);
router.post('/guides/:tripId', requirePermission('ops.manage'), createGuidePayment);

// Summary & Seats
router.get('/accounting-summary/:tripId', requirePermission('ops.view'), getOpsAccountingSummary);
router.get('/seats/:tripId', requirePermission('ops.view'), getSeatConfig);

// SOP & Checklists & Incidents
router.get('/checklists/:tripId', requirePermission('ops.view'), getChecklist);
router.post('/checklists/toggle', requirePermission('ops.checklist'), toggleChecklistItem);
router.get('/incidents/:tripId', requirePermission('ops.view'), getIncidents);
router.post('/incidents', requirePermission('ops.checklist'), createIncident);

// Auto Allocation Engine (Draft, Confirm, Override)
router.get('/auto-allocate/:tripId', requirePermission('ops.allocate'), generateAllocation);
router.post('/auto-allocate/confirm', requirePermission('ops.allocate'), confirmAllocation);
router.post('/auto-allocate/override', requirePermission('ops.allocate'), overrideAllocation);

module.exports = router;
