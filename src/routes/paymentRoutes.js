const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const userController = require('../controllers/userController');

router.put('/', paymentController.createPayment);
router.get('/', paymentController.getAllPayments);
router.get(
  '/customerPay/:customerId',
  paymentController.isExistPaymentCustomer,
);

router.put('/customerPay/:paymentId/:entryId', paymentController.deletePayment);
router.post('/statistic', userController.statistic);

module.exports = router;
