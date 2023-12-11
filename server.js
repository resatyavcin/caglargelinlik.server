if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` });
}

const mongoose = require('mongoose');
const express = require('express');
const status = require('http-status');
const moment = require('moment');
const cors = require('cors');

require('moment/locale/tr');
moment.locale('tr');

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
  cors({
    credentials: true,
    origin: [
      'http://localhost:3000',
      'https://caglargelinlik-client.vercel.app',
    ],
  }),
);

server.use(express.json());
server.use('/v1', app);

server.use((error, req, res, next) => {
  return res.status(500).json(responseJSON(status[500], error.message));
});

server.listen(PORT, function () {
  databaseConnection();
  console.log(`Server ${PORT} üzerinde dinleniyor...`);
});
