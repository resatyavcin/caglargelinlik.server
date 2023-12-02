const status = require('http-status');
const { responseJSON } = require('../utils');

module.exports = {
  authMiddleware: function (requiredRoles = []) {
    return function (req, res, next) {
      console.log(req.session);
      if (
        req.session.user &&
        req.session.user?.id &&
        requiredRoles.includes(req.session.user?.role)
      ) {
        return next();
      } else {
        res.json(responseJSON(status[401], status['401_MESSAGE']));
      }
    };
  },
};
