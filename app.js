require('dotenv').config()
require('./middleware/intrument')
const express = require('express')
const Sentry = require('@sentry/node')
const bodyParser = require('body-parser')
const app = express()
const PORT = process.env.PORT || 3000

const registerRoute = require('./routes/registerRoutes');
const loginRoute = require('./routes/loginRoutes');
const verifyOTPMiddleware = require('./middleware/verifyOTP');
const ticketRoute = require ('./routes/ticketRoutes');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use('/api/register', registerRoute)
app.use('/api/register/verify', verifyOTPMiddleware)
app.use('/api/login', loginRoute)
app.use('/api/ticket', ticketRoute)

Sentry.setupExpressErrorHandler(app);

app.listen (PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})