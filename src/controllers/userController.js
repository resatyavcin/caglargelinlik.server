const { authService } = require('../services');
const status = require('http-status');

function responseJSON(status, message) {
  return {
    status,
    message,
  };
}

async function createUser(req, res) {
  const { username, password, role } = req.body;
  try {
    const user = await authService.signup({ username, password, role });

    return res.status(201).json({
      result: user,
      status: responseJSON(status[201], status['201_MESSAGE']),
    });
  } catch (error) {
    return res.json(responseJSON(status[500], error.message));
  }
}

async function login(req, res) {
  const { username, password } = req.body;

  try {
    const user = await authService.signin({ username, password });

    req.session.userId = { id: user._id, role: user.role };

    return res.status(200).json({
      result: user,
      status: responseJSON(status[200], status['200_MESSAGE']),
    });
  } catch (error) {
    return res.json(responseJSON(status[500], error.message));
  }
}

async function logout(req, res) {
  req.session.userId = null;

  try {
    return res.status(200).json({
      status: responseJSON(status[200], status['200_MESSAGE']),
    });
  } catch (error) {
    return res.json(responseJSON(status[500], error.message));
  }
}

function test(req, res) {
  return res.json({
    session: req.session,
  });
}

module.exports = { createUser, login, logout, test };
