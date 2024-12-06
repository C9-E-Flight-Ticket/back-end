require('dotenv').config()
const express = require('express')
const Sentry = require('@sentry/node')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const { errorHandler } = require('./middleware/errorMiddleware')
const app = express()
const PORT = process.env.PORT || 3000

const authRoute = require('./routes/authRoutes');
const ticketRoute = require('./routes/ticketRoutes');
const flightRoute = require('./routes/flightRoutes')
const seatRoute = require('./routes/seatRoutes')
const airlineRoute = require('./routes/airlineRoutes')
const airportRoute = require('./routes/airportRoutes')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use('/api/auth', authRoute)
app.use('/api/ticket', ticketRoute)
app.use('/api/flight', flightRoute)
app.use('/api/seat', seatRoute)
app.use('/api/airline', airlineRoute)
app.use('/api/airport', airportRoute)

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})


app.use(errorHandler)
Sentry.setupExpressErrorHandler(app);

app.listen( PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})