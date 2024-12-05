if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

require('./middleware/intrument')
const express = require('express')
const Sentry = require('@sentry/node')
const bodyParser = require('body-parser')
const { errorHandler } = require('./middleware/errorMiddleware')
const app = express()
const PORT = process.env.PORT || 3000

const ticketRoute = require ('./routes/ticketRoutes');
const flightRoute = require('./routes/flightRoutes')
const seatRoute = require('./routes/seatRoutes')

const corsOptions = {
  origin: [
    'https://krisnaepras.my.id', 
    'http://localhost:3000', 
    'http://localhost:5173', 
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions))

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use('/api/ticket', ticketRoute)
app.use('/api/flight', flightRoute)
app.use('/api/seat', seatRoute)

app.use(errorHandler)
Sentry.setupExpressErrorHandler(app);

app.listen (PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})