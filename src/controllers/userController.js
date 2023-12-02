const { authService } = require('../services');
const { responseJSON } = require('../utils');
const status = require('http-status');

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

    req.session.user = { id: user._id, role: user.role };

    return res.status(200).json({
      result: user,
      status: responseJSON(status[200], status['200_MESSAGE']),
    });
  } catch (error) {
    next(error);
  }
}

async function logout(req, res, next) {
  req.session = null;

  try {
    return res.status(200).json({
      result: req.session,
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

module.exports = { createUser, login, logout, test };
