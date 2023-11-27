const status = require('http-status');

function responseJSON(status, message) {
  return {
    status,
    message,
  };
}
module.exports = {
  authMiddleware: function (requiredRole) {
    return function (req, res, next) {
      if (
        req.session &&
        req.session.userId &&
        req.session.user.role === requiredRole
      ) {
        return next();
      } else {
        res.json(responseJSON(status[401], status['401_MESSAGE']));
      }
    };
  },
};
