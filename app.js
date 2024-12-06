require('dotenv').config()
const express = require('express')
const Sentry = require('@sentry/node')
const bodyParser = require('body-parser')
const { errorHandler } = require('./middleware/errorMiddleware')
const cron = require('node-cron'); 
const { checkExpiredTransactions } = require('./services/transactionService'); 
const app = express()
const PORT = process.env.PORT || 3000

const transactionRoutes = require("./routes/transactionRoutes");
const registerRoute = require('./routes/registerRoutes');
const loginRoute = require('./routes/loginRoutes');
const ticketRoute = require ('./routes/ticketRoutes');
const forgotPasswordRoute = require('./routes/forgotPasswordRoutes');
const flightRoute = require('./routes/flightRoutes')
const seatRoute = require('./routes/seatRoutes')
const airlineRoute = require('./routes/airlineRoutes')
const airportRoute = require('./routes/airportRoutes')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/api/register', registerRoute)
app.use('/api/login', loginRoute)
app.use('/api/forgot-password', forgotPasswordRoute)
app.use('/api/transaction', transactionRoutes);
app.use('/api/ticket', ticketRoute)
app.use('/api/flight', flightRoute)
app.use('/api/seat', seatRoute)
app.use('/api/airline', airlineRoute)
app.use('/api/airport', airportRoute)

cron.schedule('* * * * *', async () => {
  try {
    await checkExpiredTransactions();
  } catch (error) {
    console.error('Error checking expired transactions:', error);
  }
});

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

app.use(errorHandler)
Sentry.setupExpressErrorHandler(app);

app.listen (PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})
