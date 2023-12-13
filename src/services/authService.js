const userService = require('./userService');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = {
  signup: async function (props) {
    const { username, password, ...rest } = props;
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const findUser = await userService.find({
      where: { property: 'username', propResult: username },
    });

    if (findUser) {
      throw new Error(
        'Kullanıcı kaydetme başarısız. Sistemde böyle bir kullanıcı bulunmaktadır.',
      );
    }
    await userService.createUser({
      ...rest,
      username,
      password: hashedPassword,
    });
  },

  signin: async function (props) {
    const { username, password } = props;

    const findUser = await userService.find({
      where: { property: 'username', propResult: username },
    });

    if (!findUser) {
      throw new Error('Kullanıcı bulunmamaktadır.');
    }

    const token = jwt.sign(
      { username: findUser.username, role: findUser.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '1d' },
    );

    const isMatchPassword = bcrypt.compareSync(password, findUser.password);

    if (!isMatchPassword) {
      throw new Error('Parola Eşleşmedi.');
    }

    return { user: findUser, token };
  },
};
