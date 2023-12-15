const express = require('express');
const router = express.Router();

const bookingController = require('../controllers/bookingController');

router.post('/createBooking', bookingController.createBooking);
router.put('/cancelBooking/:booking', bookingController.cancelBooking);
router.get('/findBookings/:customerId', bookingController.findBookings);
router.get('/calendar', bookingController.calendar);

module.exports = router;
