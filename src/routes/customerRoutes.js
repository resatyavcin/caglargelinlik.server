const express = require('express');
const router = express.Router();

const customerContoller = require('../controllers/customerContoller');

router.post('/createCustomer', customerContoller.createCustomer);
router.get('/findCustomers', customerContoller.findCustomers);
router.delete('/deleteCustomer/:customerId', customerContoller.deleteCustomer);

module.exports = router;
