const express = require('express');
const router = express.Router();

const bookingController = require('../controllers/bookingController');

router.post('/createBooking', bookingController.createBooking);
router.get('/findBookings/:customerId', bookingController.findBookings);

module.exports = router;
