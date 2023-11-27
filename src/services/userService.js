const UserModel = require('../models/User');

module.exports = {
  createUser: function ({ username, password, role }) {
    const user = new UserModel({ username, password, role });
    return user.save();
  },

  find: async function ({ id, where }) {
    const { property, propResult } = where;

    const user = await UserModel.find({
      $or: [{ _id: id }, { [property]: propResult }],
    });

    return user[0];
  },
};
