const mongoose = require('mongoose');
const PaymentModal = require('../models/Payment');
module.exports = {
  createInitialPayment: async ({ amount, booking, customer }) => {
    const pay = await PaymentModal.create(
      new PaymentModal({ remainingAmount: amount, amount, booking, customer }),
    );

    return pay;
  },

  deletePaymentEntry: async (paymentId, entryId) => {
    const payment = await PaymentModal.findById(paymentId);
    if (!payment) {
      throw new Error('Ödeme bulunamadı');
    }
    const entryObjectId = new mongoose.Types.ObjectId(entryId);

    let entryIndex = payment.paymentHistory.findIndex((p) =>
      p._id.equals(entryObjectId),
    );

    if (entryIndex === -1) {
      throw new Error('Belirtilen ödeme kaydı bulunamadı');
    }

    let deletedEntry = payment.paymentHistory.splice(entryIndex, 1)[0];
    payment.remainingAmount += deletedEntry.paidAmount;

    await payment.save();
    return payment;
  },
};
