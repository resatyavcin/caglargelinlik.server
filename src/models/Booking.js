const mongoose = require('mongoose');
const { EventTypeEnum } = require('../utils');

const schema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },

    extrauuid: { type: String, unique: true },
    eventType: {
      type: String,
      enum: Object.values(EventTypeEnum),
    },

    isSell: { type: Boolean, required: true },

    primaryTrialDate: { type: Date },
    secondaryTrialDate: { type: Date },

    eventDate: { type: Date },
    note: { type: String },
  },
  { timestamps: true },
);

const bookingSchema = mongoose.model('Booking', schema);

module.exports = bookingSchema;
