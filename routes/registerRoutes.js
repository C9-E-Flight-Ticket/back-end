const express = require('express');
const router = express.Router();
const RegisterController = require('../controllers/registerController');
const resendOtp = require('../utils/resendOtp');

// Registration routes
router.post('/', RegisterController.register);
router.post('/verify-email/:id', RegisterController.verifyEmail);
router.post('/resend-otp/:id', resendOtp);

module.exports = router;
