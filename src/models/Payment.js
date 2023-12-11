const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    remainingAmount: {
      type: Number,
    },
    booking: { type: String },
    paymentHistory: [
      {
        paymentDate: {
          type: Date,
          required: true,
        },
        paidBy: {
          type: String,
          required: true,
        },
        paidAmount: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  { timestamps: true },
);

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
