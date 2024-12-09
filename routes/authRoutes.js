const express = require('express');
const router = express.Router();
const { asyncErrorHandler } = require("../middleware/errorMiddleware");
const AuthMiddleware = require('../middleware/authMiddleware');
const LoginController = require('../controllers/loginController');
const RegisterController = require('../controllers/registerController');
const ForgotPasswordController = require('../controllers/forgotpasswordController');
const resendOtp = require('../utils/resendOtp');

// Login routes
router.post('/login', asyncErrorHandler(LoginController.login));
router.post('/logout', AuthMiddleware.verifyToken, asyncErrorHandler(LoginController.logout));

// Example Get profile
router.get('/profile', AuthMiddleware.verifyToken, (req, res) => {
    res.json({
        status: "success",
        data: req.user
    });
});

// Registration routes
router.post('/register', asyncErrorHandler(RegisterController.register));
router.post('/verify-email/:id', asyncErrorHandler(RegisterController.verifyEmail));
router.post('/resend-otp/:id', resendOtp);

// Forgot Password Routes
router.post('/forgot-password', asyncErrorHandler(ForgotPasswordController.forgotPassword));
router.post('/verify-otp/:id', asyncErrorHandler(ForgotPasswordController.verifyOTP));
router.post('/reset-password/:id', asyncErrorHandler(ForgotPasswordController.resetPassword));
router.post('/resend-password-otp/:id', (req, res) => {
    req.body.type = 'PASSWORD_RESET';
    resendOtp(req, res);
});


// TODO: Oauth Routes

module.exports = router;
