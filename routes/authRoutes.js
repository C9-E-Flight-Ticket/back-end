const express = require("express");
const router = express.Router();
const { asyncErrorHandler } = require("../middleware/errorMiddleware");
const AuthMiddleware = require("../middleware/authMiddleware");
const LoginController = require("../controllers/loginController");
const RegisterController = require("../controllers/registerController");
const ForgotPasswordController = require("../controllers/forgotpasswordController");
const resendOtp = require("../utils/resendOtp");
const passport = require("../libs/passport");
const OauthController = require("../controllers/oauthController");

// Login routes
router.post("/login", asyncErrorHandler(LoginController.login));

// Registration routes
router.post("/register", asyncErrorHandler(RegisterController.register));
router.post(
  "/verify-email/:id",
  asyncErrorHandler(RegisterController.verifyEmail)
);
router.post("/resend-otp/:id", resendOtp);

// Forgot Password Routes
router.post(
  "/forgot-password",
  asyncErrorHandler(ForgotPasswordController.forgotPassword)
);
router.post(
  "/verify-otp/:id",
  asyncErrorHandler(ForgotPasswordController.verifyOTP)
);
router.post(
  "/reset-password/:id",
  asyncErrorHandler(ForgotPasswordController.resetPassword)
);
router.post("/resend-password-otp/:id", (req, res) => {
  req.body.type = "PASSWORD_RESET";
  resendOtp(req, res);
});

// Oauth Routes
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: true,
  })
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/api/auth/google/failure",
    session: true,
  }),
  asyncErrorHandler(OauthController.googleCallback)
);
router.get("/google/failure", asyncErrorHandler(OauthController.googleFailure));

// Logout routes
router.get(
  "/logout",
  AuthMiddleware.verifyAuthentication,
  asyncErrorHandler(LoginController.logout)
);

// Example Get profile
router.get("/profile", AuthMiddleware.verifyAuthentication, (req, res) => {
  res.json({
    status: "success",
    data: req.user,
  });
});

module.exports = router;
