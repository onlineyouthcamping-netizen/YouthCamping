const express = require('express');
const router = express.Router();
const { authenticate, requirePermission } = require('../middleware/auth');
const hotelRatesController = require('../controllers/hotelRatesController');

const mutateRates = [authenticate, requirePermission('vendors.rates.manage')];

router.post('/create', ...mutateRates, hotelRatesController.createRates);
router.get('/:hotel_id', hotelRatesController.getRates);
router.patch('/:rate_id', ...mutateRates, hotelRatesController.updateRate);
router.delete('/:rate_id', ...mutateRates, hotelRatesController.deleteRate);

module.exports = router;
