const express = require("express");
const router = express.Router();
const TransactionController = require("../controllers/transactionController");

router.post("/order", TransactionController.createTicketTransaction);
router.post("/midtrans-callback", TransactionController.handleMidtransCallback);
router.get('/status/:bookingCode', TransactionController.getTransactionStatus);
router.get('/transactions', TransactionController.getAllTransactions);

router.get('/generate-pdf/:bookingCode', TransactionController.generateTransactionPDF);
router.get('/download/:bookingCode.pdf', TransactionController.downloadPDF);

module.exports = router;
