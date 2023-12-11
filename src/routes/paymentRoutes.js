const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.put('/', paymentController.createPayment);
router.get('/', paymentController.getAllPayments);
router.get(
  '/customerPay/:customerId',
  paymentController.isExistPaymentCustomer,
);

module.exports = router;
