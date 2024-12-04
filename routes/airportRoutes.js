const express = require('express');
const router = express.Router();
const AirportController = require('../controllers/AirportController');

router.get('/', AirportController.getAllAirports);
router.get('/:id', AirportController.getAirportById);



module.exports = router;