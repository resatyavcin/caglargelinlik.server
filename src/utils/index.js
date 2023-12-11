const moment = require('moment');
const momentRange = require('moment-range');
momentRange.extendMoment(moment);

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
    for (let i = 0; i < dates.length - 1; i++) {
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

function isDateRangeIntersection(date1, date2, startDate, endDate) {
  const momentDate1 = moment(date1);
  const momentDate2 = moment(date2);
  const momentStartDate = moment(startDate);
  const momentEndDate = moment(endDate);

  const isOverlap =
    (momentDate1.isSameOrAfter(momentStartDate) &&
      momentDate1.isBefore(momentEndDate)) ||
    (momentDate2.isSameOrAfter(momentStartDate) &&
      momentDate2.isBefore(momentEndDate)) ||
    (momentStartDate.isSameOrAfter(momentDate1) &&
      momentStartDate.isBefore(momentDate2)) ||
    (momentEndDate.isSameOrAfter(momentDate1) &&
      momentEndDate.isBefore(momentDate2));

  return isOverlap;
}

function formatDate(date) {
  moment(date).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
}

function findLatestProduct({ product, latestDate }) {
  if (product.rentHistory && product.rentHistory.length > 0) {
    let maxDate;

    product.rentHistory.forEach((rent) => {
      if (rent.isReturn) {
        return;
      }

      if (rent.isPackage && rent.packageDetails) {
        const departureDate = moment(rent.packageDetails.departureDate);
        const arrivalDate = moment(rent.packageDetails.arrivalDate);

        if (!departureDate.isValid() || !arrivalDate.isValid()) {
          return;
        }

        maxDate = moment.max(departureDate, arrivalDate);
      } else {
        const productDeliveryDate = moment(rent.productDeliveryDate);
        const productReturnDate = moment(rent.productReturnDate);

        if (!productDeliveryDate.isValid() || !productReturnDate.isValid()) {
          return;
        }

        maxDate = moment.max(productDeliveryDate, productReturnDate);
      }
    });

    if (maxDate.isAfter(latestDate)) {
      return false;
    }

    return true;
  }

  return true;
}

module.exports = {
  responseJSON,
  ProductCodeEnum,
  checkDateOrder,
  EventTypeEnum,
  formatDate,
  isDateRangeIntersection,
  findLatestProduct,
};
