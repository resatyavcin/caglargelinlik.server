if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` });
}

const express = require('express');
const mongoose = require('mongoose');

const app = express();

const PORT = process.env.PORT || 3000;

async function databaseConnection() {
  try {
    await mongoose.connect(process.env.DB_STRING);
    console.log("MongoDB'ye başarı ile bağlanılamadı");
  } catch (error) {
    console.log("MongoDB'ye Bağlanılamadı");
  }
}

app.get('/', (req, res) => {
  res.send('Health Check Done');
});

app.listen(PORT, async function () {
  await databaseConnection();
  console.log(`Server ${PORT} üzerinde dinleniyor...`);
});
