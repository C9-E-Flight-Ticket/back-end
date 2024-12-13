const express = require("express");
const router = express.Router();
const { asyncErrorHandler } = require("../middleware/errorMiddleware");
const SeatController = require("../controllers/seatController");
const AuthMiddleware = require('../middleware/authMiddleware');

router.use(AuthMiddleware.verifyAuthentication);

router.get("/detail-flight", asyncErrorHandler(SeatController.getDetailFlight));

router.get("/", SeatController.getAllSeats);
router.get("/:id", SeatController.getSeatById);
router.post("/", SeatController.createSeat);
router.put("/:id", SeatController.updateSeat);
router.delete("/:id", SeatController.deleteSeat);

module.exports = router;
