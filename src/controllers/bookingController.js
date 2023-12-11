const BookingModel = require('../models/Booking');
const customerSchema = require('../models/Costumer');
const { productService, paymentService } = require('../services');

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
    totalAmount,
    soldDate,
  } = req.body;

  const { eventType, productTakeType } = req.query;

  try {
    const booking = {
      customer,
      primaryTrialDate,
      secondaryTrialDate,
      isPackage,
      eventType,
      eventDate,
      productDeliveryDate,
      productReturnDate,
    };

    let product;
    let payment;
    const uuid = uuidv4();

    if (productTakeType === 'rent') {
      await checkDateOrder([
        primaryTrialDate,
        secondaryTrialDate,
        productDeliveryDate,
        productReturnDate,
      ]);
    }

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

      payment = await paymentService.createInitialPayment({
        amount: totalAmount,
        booking: uuid,
        customer,
      });

      await customerSchema.findByIdAndUpdate(customer, {
        paymentId: payment?._id,
      });
    }

    if (productTakeType === 'sell') {
      product = await productService.sellProduct({
        booking: uuid,
        productName,
        specialCode: productSpecialCode,
        productCode: eventType,
        date: soldDate,
      });

      payment = await paymentService.createInitialPayment({
        amount: totalAmount,
        booking: uuid,
        customer,
      });

      await customerSchema.findByIdAndUpdate(customer, {
        $push: { paymentId: payment?._id },
      });
    }

    await BookingModel.create(
      new BookingModel({
        ...booking,
        product: product?._id,
        payment: payment?._id,
        extrauuid: uuid,
        isSell: productTakeType === 'sell',
      }),
    );

    return res.status(201).json({
      result: { data: booking, message: 'Başarıyla kaydedildi' },
      status: responseJSON(status[201], status['201_MESSAGE']),
    });
  } catch (error) {
    next(error);
  }
}

async function findBookings(req, res, next) {
  const { customerId } = req.params;
  try {
    const booking = await BookingModel.find({ customer: customerId });

    return res.status(200).json({
      result: booking,
      status: responseJSON(status[200], status['200_MESSAGE']),
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { createBooking, findBookings };
