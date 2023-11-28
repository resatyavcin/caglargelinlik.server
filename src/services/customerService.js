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

  findCustomers: async function ({
    id,
    where,
    options = {},
    paginable = false,
  }) {
    let currentWhereQuery = {};
    let isPaginate = paginable;
    let customers;

    if (where) {
      currentWhereQuery = where;
    }

    const { property, propResult } = currentWhereQuery;
    const { currentPage, perPage } = options;

    const countCustomer = await CustomerModel.countDocuments();
    const totalPageCount = Math.ceil(countCustomer / perPage);

    const query = {};
    query.$or = [id ? { _id: id } : {}];

    if (property) {
      query.$or.push({ [property]: propResult });
    }

    if (currentPage > totalPageCount || currentPage < 1) {
      return [];
    }

    let queryBuilder = CustomerModel.find(query);

    if (isPaginate) {
      queryBuilder = queryBuilder
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    }

    customers = await queryBuilder;

    if (!customers) {
      throw new Error('Müşteri bulunamadı');
      return;
    }

    return customers.length > 1 ? customers : customers[0] || [];
  },

  delete: async function ({ id }) {
    const customer = await CustomerModel.findByIdAndDelete(id);
    return customer;
  },
};
