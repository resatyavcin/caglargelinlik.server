const mongoose = require('mongoose');
const { ProductCodeEnum } = require('../utils');

const schema = new mongoose.Schema(
  {
    code: {
      type: String,
      enum: Object.values(ProductCodeEnum),
      required: true,
    },
    name: { type: String, required: true },
    isSecondHand: { type: Boolean, required: true },
    isSold: { type: Boolean, required: true },
    isActive: { type: Boolean, required: true, default: true },
  },
  { timestamps: true },
);

const productSchema = mongoose.model('Product', schema);

module.exports = productSchema;
