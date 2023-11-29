const moment = require('moment');

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

const EventTypeEnum = Object.freeze({
  WEDDING: 'WD',
  HENNA: 'HN',
  ENGAGEMENT: 'EG',
});

function checkDateOrder(dates) {
  return new Promise((resolve, reject) => {
    for (let i = 0; i < dates.length; i++) {
      let currentMoment;
      let nextMoment;
      if (dates[i]) {
        currentMoment = moment(dates[i]);
        nextMoment = moment(dates[i + 1]);
      }

      if (currentMoment && nextMoment) {
        if (currentMoment.isSameOrAfter(nextMoment)) {
          throw new Error('Tarihler olay akış sırasına uygun değil.');
        }
      }
    }

    resolve(null);
  });
}

function formatDate(date) {
  moment(date).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
}

module.exports = {
  responseJSON,
  ProductCodeEnum,
  checkDateOrder,
  EventTypeEnum,
  formatDate,
};
