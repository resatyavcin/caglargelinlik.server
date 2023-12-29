const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    code: { type: String, required: true },
  },
  { timestamps: true },
);

const verifyCode = mongoose.model('VerifyCode', schema);
module.exports = verifyCode;
