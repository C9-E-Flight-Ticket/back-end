require('dotenv').config()
require('./middleware/intrument')
const express = require('express')
const Sentry = require('@sentry/node')
const bodyParser = require('body-parser')
const app = express()
const PORT = process.env.PORT || 3000

const ticketRoute = require ('./routes/ticketRoutes');
const flightRoute = require('./routes/flightRoutes')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use('/api/ticket', ticketRoute)
app.use('/api/flight', flightRoute)

Sentry.setupExpressErrorHandler(app);

app.listen (PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})