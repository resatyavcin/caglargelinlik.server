const ProductModel = require('../models/Product');
const moment = require('moment');
const { isDateRangeIntersection, findLatestProduct } = require('../utils');

const uuid = require('uuid');
const { v4: uuidv4 } = uuid;

function generateUniqueString() {
  // UUID oluştur
  const uniqueId = uuidv4();

  // Şu anki zamanı al
  const currentTime = new Date();

  // Zaman bilgisini stringe çevir ve ekleyerek benzersiz bir string oluştur
  const uniqueString = `${uniqueId}_${currentTime
    .toISOString()
    .replace(/[-:]/g, '')
    .replace('.', '')
    .slice(0, -5)}`;

  return uniqueString;
}

module.exports = {
  create: async function ({ code, name, isSecondHand, specialCode }) {
    const product = new ProductModel({
      code,
      name,
      isSecondHand,
      firstStatusSecondHand: isSecondHand,
      specialCode,
    });

    return product.save();
  },

  findProducts: async function ({
    code,
    where,
    options = { findMethod: '$or' },
  }) {
    let currentWhereQuery = {};
    let products;

    if (where) {
      currentWhereQuery = where;
    }

    const { property, propResult } = currentWhereQuery;
    const { findMethod } = options;

    const query = {};
    query[findMethod] = [{ code }];

    if (property) {
      query[findMethod].push({ [property]: propResult });
    }

    let queryBuilder = ProductModel.find(query);

    products = await queryBuilder;

    if (!products) {
      throw new Error('Ürün bulunamadı');
      return;
    }

    return products || [];
  },

  displayProductNames: async function ({ code }) {
    const products = await ProductModel.aggregate([
      { $match: { $and: [{ code }] } },
      { $group: { _id: '$name' } },
      { $project: { _id: 0, productName: '$_id' } },
    ]);
    return products.map((prd) => prd.productName);
  },

  rentProduct: async function ({
    code,
    name,
    startDate,
    endDate,
    isPackage,
    productSpecialCode,
  }) {
    let currentProduct;

    if (!name || !code) {
      throw new Error('Ürün İsmi veya Kod değeri eksik.');
    }

    if (!startDate || !endDate) {
      throw new Error('Başlangıç veya bitiş değerleri eksik.');
    }

    let products = await ProductModel.find({
      code,
      name,
    });

    const unSoldProducts = products.filter((product) => {
      return product.isSold === false;
    });

    if (unSoldProducts.length === 0) {
      throw new Error('Bu üründen depoda bulunmamaktadır.');
    }

    function findAvailableProductAsync(unSoldProducts, startDate, endDate) {
      return new Promise((resolve, reject) => {
        const availableProduct = unSoldProducts.filter(({ rentHistory }) => {
          return rentHistory.length === 0
            ? true
            : rentHistory.every((obj) => {
                const {
                  isPackage,
                  packageDetails,
                  productDeliveryDate,
                  productReturnDate,
                } = obj;

                if (!isPackage) {
                  return !isDateRangeIntersection(
                    startDate,
                    endDate,
                    productDeliveryDate,
                    productReturnDate,
                  );
                }

                return !isDateRangeIntersection(
                  startDate,
                  endDate,
                  packageDetails.departureDate,
                  packageDetails.arrivalDate,
                );
              });
        });

        if (availableProduct) {
          resolve(availableProduct);
        } else {
          reject(new Error('No available product found'));
        }
      });
    }

    const availableProduct = await findAvailableProductAsync(
      unSoldProducts,
      startDate,
      endDate,
    );

    if (availableProduct.length === 0) {
      throw new Error('Tarih arasında bu ürünler boşta değildir.');
    }

    currentProduct = availableProduct.find(
      (prd) => prd.specialCode === productSpecialCode,
    );

    if (!currentProduct) {
      throw new Error('Bu ürün depoda kalmamıştır.');
    }

    if (!currentProduct.isSecondHand) {
      currentProduct.isSecondHand = true;
    }

    if (isPackage) {
      currentProduct.rentHistory.push({
        booking: generateUniqueString(),
        isPackage: true,
        packageDetails: {
          departureDate: startDate,
          arrivalDate: endDate,
        },
      });
    }

    if (!isPackage) {
      currentProduct.rentHistory.push({
        booking: generateUniqueString(),
        isPackage: false,
        productDeliveryDate: startDate,
        productReturnDate: endDate,
      });
    }

    await currentProduct.save();
    return currentProduct;
  },

  cancelRentProduct: async function ({ booking }) {
    let products = await ProductModel.find({}, 'rentHistory');

    if (!booking) {
      throw new Error('Randevu benzersiz kimlik bulunmamaktadır.');
    }

    let currentHistory = new Promise((resolve, reject) => {
      const promises = [];

      products.forEach(({ _id, rentHistory }) => {
        rentHistory.forEach(async (history) => {
          if (history.booking === booking) {
            promises.push(_id);
          }
        });
      });

      if (promises.length > 0) {
        resolve(promises);
      } else {
        reject('No matching product found for the given booking.');
      }
    });

    const currentHistoryResult = await currentHistory;

    let product = await ProductModel.findOne({ _id: currentHistoryResult[0] });

    product['rentHistory'] = product?.rentHistory?.filter(
      (his) => his.booking !== booking,
    );

    if (!product?.firstStatusSecondHand && product?.rentHistory?.length === 0) {
      product['isSecondHand'] = false;
    }
    await product.save();
    return product;
  },

  receivingTheRentedProductBack: async function ({ booking }) {
    let products = await ProductModel.find({}, 'rentHistory');

    if (!booking) {
      throw new Error('Randevu benzersiz kimlik bulunmamaktadır.');
    }

    let currentHistory = new Promise((resolve, reject) => {
      const promises = [];

      products.forEach(({ _id, rentHistory }) => {
        rentHistory.forEach(async (history) => {
          if (history.booking === booking) {
            promises.push(_id);
          }
        });
      });

      if (promises.length > 0) {
        resolve(promises);
      } else {
        reject('No matching product found for the given booking.');
      }
    });

    const currentHistoryResult = await currentHistory;

    let product = await ProductModel.findOne({ _id: currentHistoryResult[0] });

    product['rentHistory'] = product?.rentHistory?.map((his) => {
      if (his.booking === booking) {
        his.isReturn = true;
      }

      return his;
    });

    //prop yosa diye koyuldu, not imp.
    if (!product.firstStatusSecondHand) {
      product.firstStatusSecondHand = product.isSecondHand;
    }

    await product.save();
    return product;
  },

  receivingTheRentedProductBackCancel: async function ({ booking }) {
    let products = await ProductModel.find({}, 'rentHistory');

    if (!booking) {
      throw new Error('Randevu benzersiz kimlik bulunmamaktadır.');
    }

    let currentHistory = new Promise((resolve, reject) => {
      const promises = [];

      products.forEach(({ _id, rentHistory }) => {
        rentHistory.forEach(async (history) => {
          if (history.booking === booking) {
            promises.push(_id);
          }
        });
      });

      if (promises.length > 0) {
        resolve(promises);
      } else {
        reject('No matching product found for the given booking.');
      }
    });

    const currentHistoryResult = await currentHistory;

    let product = await ProductModel.findOne({ _id: currentHistoryResult[0] });

    product['rentHistory'] = product?.rentHistory?.map((his) => {
      if (his.booking === booking) {
        his.isReturn = false;
      }

      return his;
    });

    //prop yosa diye koyuldu, not imp.
    if (!product.firstStatusSecondHand) {
      product.firstStatusSecondHand = product.isSecondHand;
    }

    await product.save();
    return product;
  },

  sellProduct: async function ({ productCode, productName, date }) {
    const booking = generateUniqueString();
    if (!date) {
      throw new Error('Tarih girilmelidir');
    }
    let products = await ProductModel.find(
      { code: productCode, name: productName, isSold: false },
      'rentHistory',
    );

    if (products.length === 0) {
      throw new Error('Elimizde satılık bu ürün kalmamıştır.');
    }
    const maxLateProduct = findLatestProduct(products);

    const product = await ProductModel.findById(maxLateProduct);

    if (moment(date).isSameOrBefore(maxLateProduct)) {
      throw new Error(
        'Ürünlerin en geç bulunan kiralama hizmeti bitmeden, ürün satılamaz.',
      );
    }

    product.isSold = true;
    product.soldDate = date;
    product.booking = booking;

    await product.save();
    return product;
  },

  cancelSellProduct: async function ({ productCode, productName, booking }) {
    if (!booking) {
      throw new Error('Randevu benzersiz kimlik bulunmamaktadır.');
    }

    let product = await ProductModel.findOne(
      { code: productCode, name: productName, booking },
      'rentHistory',
    );

    if (!product) {
      throw new Error('Ürün bulunamadı');
    }

    product.booking = undefined;
    product.isSold = false;
    product.soldDate = undefined;

    await product.save();
    return product;
  },

  delete: async function ({ productId }) {
    const product = await ProductModel.findById(productId);

    if (product === null) {
      throw new Error('Ürün Bulunamadı.');
    }

    if (!product.isSold && product?.rentHistory.length === 0) {
      const deletedProduct = await ProductModel.findByIdAndDelete(productId);
      return deletedProduct;
    }

    throw new Error(
      'Silinemedi. Kiralama geçmişi bulunan ürünler veya satılan ürünler silinemez.',
    );
  },
};
