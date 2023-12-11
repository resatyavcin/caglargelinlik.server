const userRoutes = require('./userRoutes');
const productRoutes = require('./productRoutes');
const customerRoutes = require('./customerRoutes');
const bookingRoutes = require('./bookingRoutes');
const paymentRoutes = require('./paymentRoutes');
const _2faRoutes = require('./2faRoutes');

module.exports = {
  _2faRoutes,
  userRoutes,
  productRoutes,
  customerRoutes,
  bookingRoutes,
  paymentRoutes,
};
