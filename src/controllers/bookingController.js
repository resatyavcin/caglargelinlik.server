const mongoose = require('mongoose');
const bookingSchema = require('../models/Booking');
const BookingModel = require('../models/Booking');
const customerSchema = require('../models/Costumer');
const paymentSchema = require('../models/Payment');
const { productService, paymentService } = require('../services');

const { responseJSON, checkDateOrder } = require('../utils');
const status = require('http-status');
const { v4: uuidv4 } = require('uuid');
const {
  cancelSellProduct,
  cancelRentProduct,
} = require('../services/productService');
const productSchema = require('../models/Product');
const moment = require('moment');

async function createBooking(req, res, next) {
  const {
    customer,
    primaryTrialDate,
    secondaryTrialDate,
    isPackage,
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

async function cancelBooking(req, res, next) {
  try {
    if (!req.params.booking) {
      throw new Error('Booking parametresi eksik.');
    }

    const booking = await bookingSchema.findOne({
      extrauuid: req.params.booking,
    });

    if (!booking) {
      throw new Error('Rezervasyon bulunamadı.');
    }

    await bookingSchema.deleteOne({
      extrauuid: req.params.booking,
    });

    const payment = await paymentSchema.findOne({
      booking: req.params.booking,
    });
    if (!payment) {
      throw new Error('Ödeme bilgisi bulunamadı.');
    }
    await paymentSchema.deleteOne({
      booking: req.params.booking,
    });

    const customer = await customerSchema.findOne({
      _id: payment.customer,
    });

    if (!customer) {
      throw new Error('Müşteri bulunamadı.');
    }

    updatedData = customer?.paymentId.filter(
      (pay) => !pay?.equals(new mongoose.Types.ObjectId(payment?._id)),
    );

    customer['paymentId'] = updatedData;
    customer.save();

    const prd = await productSchema.findOne({ _id: booking.product });

    if (!prd) {
      throw new Error('Ürün bulunamadı.');
    }

    const rentHistoryItem = prd?.rentHistory.find(
      (item) => item.booking === booking.extrauuid,
    );

    if (booking.isSell) {
      await cancelSellProduct({
        productCode: prd.code,
        productName: prd.name,
        booking: booking?.extrauuid,
      });
    } else {
      await cancelRentProduct({ booking: rentHistoryItem?.booking });
    }

    return res.status(200).json({
      result: 'Başarılı bir şekilde randevu iptal edilmiştir.',
      status: responseJSON(status[200], status['200_MESSAGE']),
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

async function calendar(req, res, next) {
  try {
    const bookings = await bookingSchema
      .find()
      .populate('product')
      .populate('customer')
      .exec();

    const formatDate = (date) => moment(date).format('YYYY-MM-DD');
    const result = bookings.map((booking) => {
      let result = {
        primaryTrialDate: booking.primaryTrialDate,
        secondaryTrialDate: booking.secondaryTrialDate,
        customer: booking.customer,
        bookingExtrauuid: booking.extrauuid,
      };

      if (booking.product) {
        const packageEntry = booking.product.rentHistory.find(
          (entry) => entry.isPackage,
        );
        if (packageEntry) {
          result.eventDate = booking.eventDate;
          result.departureDate = packageEntry.packageDetails.departureDate;
          result.arrivalDate = packageEntry.packageDetails.arrivalDate;
        }
      }

      return result;
    });

    // Şimdi tarihleri gruplayın
    const groupedByDate = {};

    result.forEach((item) => {
      const datesToCheck = [
        {
          date: formatDate(new Date(item.eventDate)),
          name: 'eventDate',
        },
        {
          date: formatDate(new Date(item.primaryTrialDate)),
          name: 'primaryTrialDate',
        },
        {
          date: formatDate(new Date(item.secondaryTrialDate)),
          name: 'secondaryTrialDate',
        },
        {
          date: formatDate(new Date(item.departureDate)),
          name: 'departureDate',
        },
        {
          date: formatDate(new Date(item.arrivalDate)),
          name: 'arrivalDate',
        },
      ];

      datesToCheck.forEach((dateObj) => {
        const date = dateObj.date;
        const name = dateObj.name;
        if (date) {
          if (!groupedByDate[date]) {
            groupedByDate[date] = [];
          }
          groupedByDate[date].push({
            name,
            props: item[name],
            customer: item['customer'],
          });
        }
      });
    });

    return res.status(200).json({
      result: groupedByDate,
      status: responseJSON(status[200], status['200_MESSAGE']),
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { createBooking, findBookings, cancelBooking, calendar };
