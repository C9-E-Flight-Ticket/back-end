const express = require('express');
const router = express.Router();
const AuthMiddleware = require('../middleware/authMiddleware');
const LoginController = require('../controllers/loginController');
const RegisterController = require('../controllers/registerController');
const ForgotPasswordController = require('../controllers/forgotpasswordController');
const resendOtp = require('../utils/resendOtp');
const passport = require('../libs/passport');
const OauthController = require('../controllers/oauthController');

// Login routes
router.post('/login', LoginController.login);

// Registration routes
router.post('/register', RegisterController.register);
router.post('/verify-email/:id', RegisterController.verifyEmail);
router.post('/resend-otp/:id', resendOtp);

// Forgot Password Routes
router.post('/forgot-password', ForgotPasswordController.forgotPassword);
router.post('/verify-otp/:id', ForgotPasswordController.verifyOTP);
router.post('/reset-password/:id', ForgotPasswordController.resetPassword);
router.post('/resend-password-otp/:id', (req, res) => {
    req.body.type = 'PASSWORD_RESET';
    resendOtp(req, res);
});

// Oauth Routes
router.get('/google',
    passport.authenticate('google', { 
        scope: ['profile', 'email'],
        session: true 
    })
);
router.get('/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/api/auth/google/failure',
        session: true
    }),
    OauthController.googleCallback
);
router.get('/google/failure', OauthController.googleFailure);

// Logout routes
router.get('/logout', AuthMiddleware.verifyAuthentication, LoginController.logout);

// Example Get profile
router.get('/profile', AuthMiddleware.verifyAuthentication, (req, res) => {
    res.json({
        status: "success",
        data: req.user
    });
});

module.exports = router;
