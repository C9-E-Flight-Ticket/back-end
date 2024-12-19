const express = require("express");
const router = express.Router();
const { asyncErrorHandler } = require("../middleware/errorMiddleware");
const ProfileContoller = require("../controllers/profileController");
const AuthMiddleware = require('../middleware/authMiddleware');

router.use(AuthMiddleware.verifyAuthentication);

router.get("/:id", asyncErrorHandler(ProfileContoller.getProfile));
router.put("/:id", asyncErrorHandler(ProfileContoller.updateProfile));
router.post("/reset-password", asyncErrorHandler(ProfileContoller.changePassword));

module.exports = router;