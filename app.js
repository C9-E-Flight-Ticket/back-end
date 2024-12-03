require('dotenv').config();
require('./middleware/intrument');
const express = require('express');
const Sentry = require('@sentry/node');
const bodyParser = require('body-parser');
const cron = require('node-cron');

const TicketController = require("./controllers/ticketController");
const ticketRoutes = require("./routes/ticketRoutes");
const flightRoutes = require('./routes/flightRoutes');
const seatRoutes = require('./routes/seatRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/api/transactions', ticketRoutes);
app.use('/api/ticket-order', ticketRoutes);
app.use('/api/flight', flightRoutes);
app.use('/api/seat', seatRoutes);

cron.schedule("*/5 * * * *", async () => {
  console.log('Running expired transaction check...');
  await TicketController.checkExpiredTransactions();
});

Sentry.setupExpressErrorHandler(app);

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

module.exports = app;
