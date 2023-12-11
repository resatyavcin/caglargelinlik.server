const mongoose = require('mongoose');
const { ProductCodeEnum } = require('../utils');

const schema = new mongoose.Schema(
  {
    code: {
      type: String,
      enum: Object.values(ProductCodeEnum),
      required: true,
    },

    specialCode: {
      type: String,
      required: true,
      unique: true,
    },

    name: { type: String, required: true },

    firstStatusSecondHand: { type: Boolean, required: true },
    isSecondHand: { type: Boolean, required: true },

    isSold: { type: Boolean, required: true, default: false },
    soldDate: Date,
    booking: { type: String },

    rentHistory: [
      {
        isPackage: { type: Boolean },
        isReturn: { type: Boolean },
        booking: { type: String },

        packageDetails: {
          departureDate: { type: Date },
          arrivalDate: { type: Date },
        },
        productDeliveryDate: { type: Date },
        productReturnDate: { type: Date },
      },
    ],
  },
  { timestamps: true },
);

const productSchema = mongoose.model('Product', schema);

module.exports = productSchema;
