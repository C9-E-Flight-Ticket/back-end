const express = require("express");
const router = express.Router();
const { asyncErrorHandler } = require("../middleware/errorMiddleware");
const AuthMiddleware = require('../middleware/authMiddleware');

const TransactionController = require("../controllers/transactionController");

router.use(AuthMiddleware.verifyAuthentication);

router.post("/order", asyncErrorHandler(TransactionController.createTicketTransaction));
router.post("/midtrans-callback", asyncErrorHandler(TransactionController.handleMidtransCallback));
router.get('/status/:bookingCode', asyncErrorHandler(TransactionController.getTransactionStatus));
router.get('/transactions', asyncErrorHandler(TransactionController.getAllTransactionsByUser));
router.get('/generate-pdf/:bookingCode', asyncErrorHandler(TransactionController.generateTransactionPDF));
router.get('/download/:bookingCode.pdf', asyncErrorHandler(TransactionController.downloadPDF));

module.exports = router;
