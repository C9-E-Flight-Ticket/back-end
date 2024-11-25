const express = require("express");
const router = express.Router();
const RegisterController = require("../controllers/registerController");
const verifyOTPMiddleware = require("../middleware/verifyOTP");
const resendOtp = require("../utils/resendOtp");

router.post("/", RegisterController.register);
router.post("/verify/:id", verifyOTPMiddleware, RegisterController.verifyEmail);
router.post("/resend-otp/:id", resendOtp);

module.exports = router;
