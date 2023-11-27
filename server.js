if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` });
}

const mongoose = require('mongoose');
const express = require('express');
const winston = require('winston');
const cookieSession = require('cookie-session');
const status = require('http-status');

const { ValidationError } = require('express-validation');

const app = require('./api');
const { responseJSON } = require('./src/utils');

const PORT = process.env.PORT || 3000;

const server = express();

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

server.use((error, req, res, next) => {
  return res.status(500).json(responseJSON(status[500], error.message));
});

server.listen(PORT, function () {
  databaseConnection();
  console.log(`Server ${PORT} üzerinde dinleniyor...`);
});
