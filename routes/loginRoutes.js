const express = require('express');
const router = express.Router();
const AuthMiddleware = require('../middleware/authMiddleware');
const LoginController = require('../controllers/loginController');

// Login routes
router.post('/', LoginController.login);
router.post('/refresh-token', LoginController.refreshToken);
router.post('/logout', AuthMiddleware.verifyToken, LoginController.logout);

// Profile route
// router.get('/profile', AuthMiddleware.verifyToken, (req, res) => {
//     const user = {
//         id: req.user.id,
//         name: req.user.name,
//         email: req.user.email,
//         role: req.user.role,
//         phoneNumber: req.user.phoneNumber,
//         is_verified: req.user.is_verified
//     };
//     res.json({ 
//         status: "success", 
//         data: user 
//     });
// });

module.exports = router;
