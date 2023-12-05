const status = require('http-status');
const jwt = require('jsonwebtoken');

module.exports = {
  authMiddleware: function () {
    return function (req, res, next) {
      const token = req.header('x-auth-token');
      if (!token)
        return res.status(401).json({
          message: 'Erişim reddedildi, token bulunamadı',
        });

      jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
        if (err) {
          return res.status(403).json({
            message: 'Erişim reddedildi, geçersiz token',
          });
        }

        req.user = user;
        next();
      });
    };
  },
};
