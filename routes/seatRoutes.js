const express = require("express");
const router = express.Router();
const { asyncErrorHandler } = require("../middleware/errorMiddleware");
const SeatController = require("../controllers/seatController");
const AuthMiddleware = require('../middleware/authMiddleware');

router.use(AuthMiddleware.verifyAuthentication);

router.get("/detail-flight", asyncErrorHandler(SeatController.getDetailFlight));

module.exports = router;
