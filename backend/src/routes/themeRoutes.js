const express = require('express');
const router = express.Router();
const themeController = require('../controllers/themeController');

router.get('/', themeController.getTheme);
router.post('/', themeController.updateTheme);
router.post('/reset', themeController.resetTheme);

module.exports = router;
