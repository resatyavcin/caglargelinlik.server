const CustomerModel = require('../models/Costumer');

module.exports = {
  create: function ({
    firstName,
    lastName,
    primaryPhone,
    secondaryPhone,
    address,
  }) {
    const customer = new CustomerModel({
      firstName,
      lastName,
      primaryPhone,
      secondaryPhone,
      address,
    });
    return customer.save();
  },

  findCustomers: async function ({ id, where }) {
    let currentWhereQuery = {};

    if (where) {
      currentWhereQuery = where;
    }

    const { property, propResult } = currentWhereQuery;

    const query = {};
    query.$or = [id ? { _id: id } : {}];

    if (property) {
      query.$or.push({ [property]: propResult });
    }

    const customers = await CustomerModel.find(query);

    if (customers.length < 0) {
      throw new Error('Müşteri bulunamadı');
      return;
    }

    return customers || [];
  },

  delete: async function ({ id }) {
    const customer = await CustomerModel.findByIdAndDelete(id);
    return customer;
  },
};
