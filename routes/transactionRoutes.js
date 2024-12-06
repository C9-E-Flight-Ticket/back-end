const express = require("express");
const router = express.Router();
const TransactionController = require("../controllers/transactionController");

router.post("/order", TransactionController.createTicketTransaction);
router.post("/midtrans-callback", TransactionController.handleMidtransCallback);
router.get('/status/:bookingCode', TransactionController.getTransactionStatus);
router.get('/transactions', TransactionController.getAllTransactions);

module.exports = router;
