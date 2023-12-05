const mongoose = require('mongoose');
const { EventTypeEnum } = require('../utils');

const schema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    extrauuid: { type: String, unique: true },
    eventType: {
      type: String,
      enum: Object.values(EventTypeEnum),
    },

    primaryTrialDate: { type: Date },
    secondaryTrialDate: { type: Date },

    eventDate: { type: Date },
  },
  { timestamps: true },
);

const bookingSchema = mongoose.model('Booking', schema);

module.exports = bookingSchema;
