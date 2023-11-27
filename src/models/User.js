const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: ['Admin', 'SalesConsultant', 'BudgetConsultant'],
      required: true,
      default: 'SalesConsultant',
    },
  },
  { timestamps: true },
);

const userSchema = mongoose.model('User', schema);
module.exports = userSchema;
