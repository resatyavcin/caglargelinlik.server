const ProductModel = require('../models/Product');
const moment = require('moment');

module.exports = {
  create: async function ({ code, name, isSecondHand, isSold, isActive }) {
    const product = new ProductModel({
      code,
      name,
      isSecondHand,
      isSold,
      isActive,
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

  getCountProductAsCodeAndName: async function ({ code, name }) {
    const countProduct = await ProductModel.countDocuments({
      $and: [{ code }, { name }],
      isActive: true,
    });
    return countProduct;
  },

  rentProduct: async function (id) {
    let product = await this.findProducts({
      where: { property: '_id', propResult: id },
    });

    product = product[0];

    if (product.isSold) {
      throw new Error('Satılan ürün kiralanamaz.');
    }

    if (!product.isActive) {
      throw new Error('Ürün boşta değildir.');
    }
    product.isRent = true;
    product.isActive = false;

    if (!product.isSecondHand) {
      product.isSecondHand = true;
    }
    product.rentDate.push(moment().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'));

    await product.save();
    return product;
  },

  cancelRentProduct: async function (id) {
    let product = await this.findProducts({
      where: { property: '_id', propResult: id },
    });

    product = product[0];

    product.isRent = false;
    product.isActive = true;

    if (product.rentDate.length >= 0) {
      product.rentDate.pop();
    }
    await product.save();
    return product;
  },

  receivingTheRentedProductBack: async function (id) {
    let product = await this.findProducts({
      where: { property: '_id', propResult: id },
    });

    product = product[0];

    if (!product.isSold && product.isRent) {
      product.isRent = false;
      product.isActive = true;
    }
    await product.save();
    return product;
  },

  sellProduct: async function (id) {
    let product = await this.findProducts({
      where: { property: '_id', propResult: id },
    });

    product = product[0];

    if (!product.isActive) {
      throw new Error('Ürün boşta değildir.');
    }
    product.isSold = true;
    product.isRent = false;
    product.isActive = false;

    if (!product.isSecondHand) {
      product.isSecondHand = true;
    }

    product.soldDate = moment().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');

    await product.save();
    return product;
  },

  cancelSellProduct: async function (id) {
    let product = await this.findProducts({
      where: { property: '_id', propResult: id },
    });

    product = product[0];

    if (!product.isSold) {
      throw new Error('Ürün satılmamıştır.');
    }

    product.isSold = false;
    product.isRent = false;
    product.isActive = true;

    product.soldDate = undefined;

    if (product.isSecondHand && product.rentDate.length === 0) {
      product.isSecondHand = true;
    }

    await product.save();
    return product;
  },

  delete: async function ({ id }) {
    let product = await ProductModel.findByIdAndDelete(id);
    product = product[0];

    return product;
  },
};
