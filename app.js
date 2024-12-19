if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

require("./middleware/intrument");
const http = require('http');
const express = require("express");
const socketIo = require('./config/socketIo');
const helmet = require("helmet");
const Sentry = require("@sentry/node");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { errorHandler } = require("./middleware/errorMiddleware");
const passport = require("./libs/passport");
const cookieMiddleware = require("./middleware/cookieMiddleware");
const swaggerUi = require("swagger-ui-express");
const { getThemeSync } = require('@intelika/swagger-theme');
const YAML = require("yamljs");
const path = require("path");


const swaggerDocument = YAML.load(path.join(__dirname, "./docs/swagger.yml"));

const app = express();
const server = http.createServer(app);

socketIo.init(server);

const PORT = process.env.PORT || 3000;

app.use(helmet());

const authRoute = require("./routes/authRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const flightRoute = require("./routes/flightRoutes");
const seatRoute = require("./routes/seatRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const profileRoute = require("./routes/profileRoutes");

const updateExpiredSeats = require("./middleware/updateExpiredSeats");

const corsOptions = {
  origin: [
    "http://localhost:5173",
    process.env.FRONTEND_URL,
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
};

app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cookieMiddleware.oauthSession);
app.use(passport.initialize());
app.use(passport.session());

app.use(updateExpiredSeats);

app.get("/", (req, res) => {
  res.send("Hello World!");
  // console.log('SESSION',req.session);
  // console.log('sessionID', req.sessionID);
  // console.log('USER', req.user);
});

app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, { customCss: getThemeSync().toString() })
);

app.use("/api/auth", authRoute);
app.use("/api/admin", adminRoutes);
app.use("/api/transaction", transactionRoutes);
app.use("/api/flight", flightRoute);
app.use("/api/seat", seatRoute);
app.use("/api/notification", notificationRoutes);
app.use("/api/profile", profileRoute);

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.use(errorHandler);
Sentry.setupExpressErrorHandler(app);

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
