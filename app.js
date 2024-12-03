require('dotenv').config()
const express = require('express')
const Sentry = require('@sentry/node')
const bodyParser = require('body-parser')
const app = express()
const PORT = process.env.PORT || 3000

const registerRoute = require('./routes/registerRoutes');
const loginRoute = require('./routes/loginRoutes');
const ticketRoute = require ('./routes/ticketRoutes');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use('/api/auth', loginRoute)
app.use('/api/auth', registerRoute)
app.use('/api/ticket', ticketRoute)

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
      status: "error",
      message: "Something broke!"
  })
})

Sentry.setupExpressErrorHandler(app);



app.listen (PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})