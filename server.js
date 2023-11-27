if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` });
}

const mongoose = require('mongoose');
const express = require('express');
const winston = require('winston');
const expressWinston = require('express-winston');
const cookieSession = require('cookie-session');
const Keygrip = require('keygrip');

const { ValidationError } = require('express-validation');

const app = require('./api');

const PORT = process.env.PORT || 3000;

const server = express();

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'booking-service' },
  transports: [
    //
    // - Write all logs with importance level of `error` or less to `error.log`
    // - Write all logs with importance level of `info` or less to `combined.log`
    //
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// if (process.env.NODE_ENV !== 'production') {
//   logger.add(
//     new winston.transports.Console({
//       format: winston.format.simple(),
//     }),
//   );
// }

app.use(
  expressWinston.logger({
    winstonInstance: logger,
    statusLevels: true,
  }),
);

async function databaseConnection() {
  try {
    await mongoose.connect(process.env.DB_STRING);
    console.log("MongoDB'ye başarı ile bağlanıldı");
  } catch (error) {
    console.log("MongoDB'ye Bağlanılamadı: ", error);
  }
}

server.use(
  cookieSession({
    name: 'session',
    keys: [
      process.env.SESSION_SECRET_KEY_ONE,
      process.env.SESSION_SECRET_KEY_TWO,
    ],

    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  }),
);

server.use(function (err, req, res, next) {
  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json(err);
  }

  return res.status(500).json(err);
});

server.use(express.json());
server.use('/v1', app);

server.listen(PORT, function () {
  databaseConnection();
  console.log(`Server ${PORT} üzerinde dinleniyor...`);
});
