const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    primaryPhone: String,
    secondaryPhone: String,
    address: String,
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  },
  { timestamps: true },
);

const customerSchema = mongoose.model('Customer', schema);

module.exports = customerSchema;
