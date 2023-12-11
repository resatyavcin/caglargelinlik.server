const express = require('express');
const router = express.Router();

const speakeasy = require('speakeasy');
const qrCode = require('qrcode');

const fs = require('fs');
const jwt = require('jsonwebtoken');

router.post('/generate-2fa-qr', async (req, res) => {
  try {
    var secret = speakeasy.generateSecret({
      name: 'caglargelinlik',
    });

    fs.writeFileSync('key.txt', secret.ascii);

    qrCode.toDataURL(secret.otpauth_url, (err, data) => {
      if (err) {
        console.log(err);
        return;
      }

      return res.json({ data });
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send('Internal Server Error');
  }
});

router.post('/', async (req, res) => {
  const { token } = req.body;

  try {
    const data = fs.readFileSync('key.txt', 'utf8');

    if (data) {
      console.log(`Used key: ********`);
    }

    const isVerify = await speakeasy.totp.verify({
      secret: data,
      encoding: 'ascii',
      token,
    });

    const tokenc = jwt.sign({ isVerify }, process.env.JWT_SECRET_KEY, {
      expiresIn: '1d',
    });

    return res.send({ data: isVerify ? tokenc : 'false' });
  } catch (error) {
    res.send(error);
  }
});

module.exports = router;
