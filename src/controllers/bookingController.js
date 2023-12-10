const BookingModel = require('../models/Booking');
const { productService } = require('../services');

const { responseJSON, checkDateOrder, formatDate } = require('../utils');
const status = require('http-status');
const { v4: uuidv4 } = require('uuid');

async function createBooking(req, res, next) {
  const {
    customer,
    primaryTrialDate,
    secondaryTrialDate,
    isPackage,
    packageDetails = {},
    eventDate,
    productDeliveryDate,
    productReturnDate,
    productName,
    productSpecialCode,
  } = req.body;

  const { eventType, productTakeType } = req.query;

  try {
    const booking = new BookingModel({
      customer,
      primaryTrialDate,
      secondaryTrialDate,
      isPackage,
      eventType,
      eventDate,
      productDeliveryDate,
      productReturnDate,
    });

    let product;
    const uuid = uuidv4();
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

    await checkDateOrder([departureDate, arrivalDate]);

    if (productTakeType === 'rent') {
      product = await productService.rentProduct({
        booking: uuid,
        name: productName,
        code: eventType,
        startDate: productDeliveryDate,
        endDate: productReturnDate,
        isPackage,
        productSpecialCode,
      });
    }

    if (productTakeType === 'sell') {
      // await productService.sellProduct(product);
    }

    await BookingModel.create({ ...booking, product, extrauuid: uuid });

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
