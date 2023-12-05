const { responseJSON } = require('../utils');
const { customerService } = require('../services');
const status = require('http-status');

async function createCustomer(req, res, next) {
  const { firstName, lastName, primaryPhone, secondaryPhone, address } =
    req.body;

  try {
    const customer = await customerService.create({
      firstName,
      lastName,
      primaryPhone,
      secondaryPhone,
      address,
    });

    return res.status(201).json({
      result: customer,
      status: responseJSON(status[201], status['201_MESSAGE']),
    });
  } catch (error) {
    next(error);
  }
}

async function findCustomers(req, res, next) {
  const { customerId } = req.query;
  try {
    const customers = await customerService.findCustomers({
      id: customerId,
    });

    return res.status(200).json({
      result: customers,
      status: responseJSON(status[200], status['200_MESSAGE']),
    });
  } catch (error) {
    next(error);
  }
}

async function deleteCustomer(req, res, next) {
  const customerId = req.params.customerId;

  try {
    const deletedProduct = await customerService.delete({ id: customerId });
    return res.status(200).json({
      result: deletedProduct,
      status: responseJSON(status[200], status['200_MESSAGE']),
    });
  } catch (error) {
    next(error);
  }
}
module.exports = { createCustomer, deleteCustomer, findCustomers };
