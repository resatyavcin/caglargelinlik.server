const BookingModel = require('../models/Booking');
const { productService } = require('../services');

const { responseJSON, checkDateOrder, formatDate } = require('../utils');
const status = require('http-status');

async function createBooking(req, res, next) {
  const {
    customer,
    product,
    primaryTrialDate,
    secondaryTrialDate,
    isPackage,
    packageDetails = {},
    eventDate,
    productDeliveryDate,
    productReturnDate,
  } = req.body;

  const { eventType, productTakeType } = req.query;

  try {
    const booking = new BookingModel({
      customer,
      product,
      primaryTrialDate,
      secondaryTrialDate,
      isPackage,
      packageDetails,
      eventType,
      eventDate,
      productDeliveryDate,
      productReturnDate,
    });

    const { departureDate, arrivalDate } = packageDetails;

    await checkDateOrder([
      primaryTrialDate,
      secondaryTrialDate,
      eventDate,
      productReturnDate,
    ]);

    await checkDateOrder([
      primaryTrialDate,
      secondaryTrialDate,
      productDeliveryDate,
      productReturnDate,
    ]);

    const a = await checkDateOrder([departureDate, arrivalDate]);

    if (productTakeType === 'rent') {
      await productService.rentProduct(product);
    }

    if (productTakeType === 'sell') {
      await productService.sellProduct(product);
    }

    await BookingModel.create(booking);

    return res.status(201).json({
      result: booking,
      status: responseJSON(status[201], status['201_MESSAGE']),
    });
  } catch (error) {
    next(error);
  }
}

async function findBookings(req, res, next) {
  try {
    const booking = await BookingModel.find();

    return res.status(200).json({
      result: booking,
      status: responseJSON(status[200], status['200_MESSAGE']),
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { createBooking, findBookings };
