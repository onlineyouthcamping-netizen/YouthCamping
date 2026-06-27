const express = require('express');
const router = express.Router();
const {
  getEntries,
  createEntry,
  approveEntry,
  rejectEntry,
  getReports
} = require('../controllers/accountingController');
const { authenticate, requirePermission } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// CRUD routes
router.get('/entries', requirePermission('accounting.view'), getEntries);
router.post('/entries', requirePermission('accounting.submit'), createEntry);
router.post('/entries/:id/approve', requirePermission('accounting.approve'), approveEntry);
router.post('/entries/:id/reject', requirePermission('accounting.approve'), rejectEntry);

// Analytics & Reports
router.get('/reports', requirePermission('accounting.view'), getReports);

module.exports = router;
