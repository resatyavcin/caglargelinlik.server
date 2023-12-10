const { authMiddleware } = require('./src/middlewares/auth');
const routes = require('./src/routes');
const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.send('Health Check Done');
});

app.use('/verify', routes._2faRoutes);
app.use('/auth', routes.userRoutes);

app.use(
  '/product',
  authMiddleware(['Admin', 'SalesConsultant']),
  routes.productRoutes,
);
app.use(
  '/booking',
  authMiddleware(['Admin', 'SalesConsultant']),
  routes.bookingRoutes,
);
app.use(
  '/customer',
  authMiddleware(['Admin', 'SalesConsultant']),
  routes.customerRoutes,
);

module.exports = app;
