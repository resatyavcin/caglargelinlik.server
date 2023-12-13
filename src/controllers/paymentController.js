const Payment = require('../models/Payment');
const moment = require('moment');
const { deletePaymentEntry } = require('../services/paymentService');
const {
  cancelSellProduct,
  cancelRentProduct,
} = require('../services/productService');

const createPayment = async (req, res, next) => {
  const { paidBy, paidAmount } = req.body;

  if (!req.query.booking) {
    res.status(500).json({ message: 'Randevu bilgisi getirilemedi' });
  }

  try {
    const payment = await Payment.findOne({ booking: req.query.booking });

    if (!payment) {
      res.status(500).json({ message: 'Ödeme bilgisi bulunamadı.' });
    }
    const currentPayment = payment;

    currentPayment.paymentHistory.push({
      paymentDate: moment().utc('tr'),
      paidBy,
      paidAmount: Number(paidAmount),
    });

    if (Number(currentPayment.remainingAmount) - Number(paidAmount) < 0) {
      return res
        .status(500)
        .json({ message: 'Ödeme tutarı kalan tutardan yüksek olamaz' });
    }

    currentPayment.remainingAmount =
      Number(currentPayment.remainingAmount) - Number(paidAmount);

    currentPayment.save();

    return res.status(200).json({ message: 'Başarı ile ödeme alınmıştır' });
  } catch (error) {
    next(error);
  }
};

const getAllPayments = async (req, res, next) => {
  if (!req.query.booking) {
    res.status(500).json({ message: 'Randevu bilgisi getirilemedi' });
  }
  try {
    const payments = await Payment.find({ booking: req.query.booking });
    res.status(200).json({ data: payments });
  } catch (error) {
    next(error);
  }
};

const isExistPaymentCustomer = async (req, res, next) => {
  if (!req.params.customerId) {
    res.status(500).json({ message: 'Müşteri bilgisi getirilemedi' });
  }
  try {
    const payments = await Payment.find({ customer: req.params.customerId });

    const isExist =
      payments.length > 0 &&
      payments?.filter((pay) => pay.remainingAmount !== 0);

    res.status(200).json({ data: isExist ? isExist : false });
  } catch (error) {
    next(error);
  }
};

const deletePayment = async (req, res, next) => {
  try {
    const updatedPayment = await deletePaymentEntry(
      req.params.paymentId,
      req.params.entryId,
    );
    res.json({ data: updatedPayment, message: 'Ödeme başarı ile güncellendi' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPayment,
  getAllPayments,
  isExistPaymentCustomer,
  deletePayment,
};
