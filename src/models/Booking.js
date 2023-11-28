const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },

    primaryTrialDate: { type: Date },
    secondaryTrialDate: { type: Date },

    isPackage: { type: Boolean },
    packageDetails: {
      departureDate: { type: Date },
      arrivalDate: { type: Date },
    },
    eventType: {
      type: String,
      enum: ['KOD_1', 'KOD_2', 'KOD_3'],
    },
    eventDate: { type: Date },
    productDeliveryDate: { type: Date },
    productReturnDate: { type: Date },
    isReturned: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const bookingSchema = mongoose.model('Booking', schema);

module.exports = bookingSchema;
