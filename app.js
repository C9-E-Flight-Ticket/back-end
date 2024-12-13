if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

require('./middleware/intrument')
const express = require('express')
const Sentry = require('@sentry/node')
const bodyParser = require('body-parser')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const { errorHandler } = require('./middleware/errorMiddleware')
const passport = require('./libs/passport')
const cookieMiddleware = require('./middleware/cookieMiddleware')
const swaggerUi = require('swagger-ui-express');
const YAML = require("yamljs");
const path = require("path");

const swaggerDocument = YAML.load(path.join(__dirname, "./docs/swagger.yml"));

const app = express()
const PORT = process.env.PORT || 3000

const authRoute = require('./routes/authRoutes');
const transactionRoutes = require("./routes/transactionRoutes");
const flightRoute = require('./routes/flightRoutes')
const seatRoute = require('./routes/seatRoutes')
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const passengerRoute = require('./routes/passengerRoutes');
const changeProfileRoute = require('./routes/changeProfileRoute');

const corsOptions = {
  origin: [
    'https://api.eflight.web.id',
    'http://api.eflight.web.id',
    'http://localhost:3000',
    'http://localhost:5173',
    process.env.FRONTEND_URL,
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}

app.use(cors(corsOptions))

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cookieMiddleware.oauthSession);
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
  res.send('Hello World!');
  // console.log('SESSION',req.session);
  // console.log('sessionID', req.sessionID);
  // console.log('USER', req.user);
});

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api/auth', authRoute)
app.use('/api/admin', adminRoutes)
app.use('/api/transaction', transactionRoutes);
app.use('/api/flight', flightRoute)
app.use('/api/seat', seatRoute)
app.use('/api/notifications', notificationRoutes)
app.use('/api/passenger', passengerRoute);
app.use('/api/profile', changeProfileRoute);

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
