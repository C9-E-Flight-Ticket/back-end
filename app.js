require('dotenv').config()
require('./middleware/intrument')
const express = require('express')
const Sentry = require('@sentry/node')
const bodyParser = require('body-parser')
const app = express()
const PORT = process.env.PORT || 3000

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Hello World!')
})

Sentry.setupExpressErrorHandler(app);

app.listen (PORT, () => {
  console.log(`Example app listening on port ${port}`)
})