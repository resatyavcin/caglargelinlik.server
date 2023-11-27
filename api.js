const routes = require('./src/routes');
const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.send('Health Check Done');
});

app.use('/auth', routes.userRoutes);

module.exports = app;
