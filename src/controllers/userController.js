const { authService } = require('../services');
const { responseJSON } = require('../utils');
const status = require('http-status');
const Payment = require('../models/Payment');

async function createUser(req, res, next) {
  const { username, password, role } = req.body;
  try {
    const user = await authService.signup({ username, password, role });

    return res.status(201).json({
      result: user,
      status: responseJSON(status[201], status['201_MESSAGE']),
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  const { username, password } = req.body;

  try {
    const user = await authService.signin({ username, password });

    return res.status(200).json({
      result: user,
      status: responseJSON(status[200], status['200_MESSAGE']),
    });
  } catch (error) {
    next(error);
  }
}

async function statistic(req, res, next) {
  const { startDate, endDate } = req.body;

  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const payments = await Payment.find({
      'paymentHistory.paymentDate': { $gte: start, $lte: end },
    }).populate('customer');

    const filteredPayments = payments.map((payment) => {
      const filteredHistory = payment.paymentHistory.filter((history) => {
        const paymentDate = new Date(history.paymentDate);
        return paymentDate >= start && paymentDate <= end;
      });

      return {
        ...payment._doc,
        paymentHistory: filteredHistory.map((pay) => pay?.paidAmount),
      };
    });

    return res.status(200).json({
      result: filteredPayments,
      status: responseJSON(status[200], status['200_MESSAGE']),
    });
  } catch (error) {
    next(error);
  }
}

function test(req, res) {
  return res.json({
    session: req.session,
  });
}

module.exports = { createUser, login, test, statistic };
