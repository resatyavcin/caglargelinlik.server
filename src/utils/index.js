function responseJSON(status, message) {
  return {
    status,
    message,
  };
}

const ProductCodeEnum = Object.freeze({
  WEDDING_DRESS: 'WD',
  HENNA: 'HN',
  ENGAGEMENT: 'EG',
});

module.exports = {
  responseJSON,
  ProductCodeEnum,
};
