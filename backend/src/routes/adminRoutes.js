const express = require('express');
const router = express.Router();
const { adminLogin, getMe } = require('../controllers/authController');
const { getStats } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');
const { validate, adminLoginSchema } = require('../validators');

router.post('/login', validate(adminLoginSchema), adminLogin);
router.get('/me', protect, getMe);
router.get('/stats', protect, getStats);

module.exports = router;
