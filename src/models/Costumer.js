const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    primaryPhone: { type: String, required: true },
    secondaryPhone: { type: String, required: true },
    address: { type: String, required: true },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  },
  { timestamps: true },
);

const customerSchema = mongoose.model('Customer', schema);

module.exports = customerSchema;
