const PaymentModal = require('../models/Payment');
module.exports = {
  createInitialPayment: async ({ amount, booking, customer }) => {
    const pay = await PaymentModal.create(
      new PaymentModal({ remainingAmount: amount, amount, booking, customer }),
    );

    return pay;
  },
};
