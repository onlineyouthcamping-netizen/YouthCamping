const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');

router.post('/send', emailController.sendBookingEmail);
router.get('/logs/:bookingId', emailController.getEmailLogs);

module.exports = router;
