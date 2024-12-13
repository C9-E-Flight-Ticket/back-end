const express = require('express');
const router = express.Router();
const PassengerController = require(`../controllers/passengerController`)

router.get('/', PassengerController.getAllPassengers);
router.get('/:id', PassengerController.getPassengerById);
router.get('/createMany', PassengerController.getCreatePassengerData);
router.post('/', PassengerController.createPassenger);
router.put('/:id', PassengerController.updatePassenger);
router.delete('/:id', PassengerController.deletePassenger);

module.exports = router;