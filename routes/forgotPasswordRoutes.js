const express = require("express");
const router = express.Router();
const ForgotPasswordController = require("../controllers/forgotpasswordController");
const resendOtp = require("../utils/resendOtp");

// Forgot Password Routes
router.post("/", ForgotPasswordController.forgotPassword);
router.post("/verify-otp/:id", ForgotPasswordController.verifyOTP);
router.post("/new-password/:id", ForgotPasswordController.resetPassword);
router.post("/resend-otp/:id", (req, res) => {
    req.body.type = 'PASSWORD_RESET';
    resendOtp(req, res);
});

module.exports = router; 