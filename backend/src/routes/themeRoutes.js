const express = require('express');
const router = express.Router();
const themeController = require('../controllers/themeController');
const { protect } = require('../middleware/auth');
const requireRole = require('../middleware/role');

// Public
router.get('/', themeController.getTheme);

// Admin protected
router.post('/', protect, requireRole('admin', 'superadmin'), themeController.updateTheme);
router.post('/reset', protect, requireRole('admin', 'superadmin'), themeController.resetTheme);

// Presets
router.get('/presets', protect, requireRole('admin', 'superadmin'), themeController.getPresets);
router.post('/presets', protect, requireRole('admin', 'superadmin'), themeController.savePreset);
router.delete('/presets/:name', protect, requireRole('admin', 'superadmin'), themeController.deletePreset);
router.post('/presets/:name/apply', protect, requireRole('admin', 'superadmin'), themeController.applyPreset);

module.exports = router;
