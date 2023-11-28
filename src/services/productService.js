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
    options = {},
    paginable = false,
  }) {
    let currentWhereQuery = {};
    let isPaginate = paginable;
    let products;

    if (where) {
      currentWhereQuery = where;
    }

    const { property, propResult } = currentWhereQuery;
    const { currentPage, perPage } = options;

    const countProduct = await ProductModel.countDocuments();
    const totalPageCount = Math.ceil(countProduct / perPage);

    const query = {};
    query.$or = [{ code }];

    if (property) {
      query.$or.push({ [property]: propResult });
    }

    if (currentPage > totalPageCount || currentPage < 1) {
      return [];
    }

    let queryBuilder = ProductModel.find(query);

    if (isPaginate) {
      queryBuilder = queryBuilder
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    }

    products = await queryBuilder;

    if (!products) {
      throw new Error('Ürün bulunamadı');
      return;
    }

    return products.length > 1 ? products : products[0] || [];
  },

  displayProductNames: async function ({ code }) {
    const products = await ProductModel.aggregate([
      { $match: { $and: [{ code, isActive: true }] } },
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
    const product = await this.findProducts({
      where: { property: '_id', propResult: id },
    });

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
    const product = await this.findProducts({
      where: { property: '_id', propResult: id },
    });

    product.isRent = false;
    product.isActive = true;

    if (product.rentDate.length >= 0) {
      product.rentDate.pop();
    }
    await product.save();
    return product;
  },

  receivingTheRentedProductBack: async function (id) {
    const product = await this.findProducts({
      where: { property: '_id', propResult: id },
    });

    if (!product.isSold && product.isRent) {
      product.isRent = false;
      product.isActive = true;
    }
    await product.save();
    return product;
  },

  sellProduct: async function (id) {
    const product = await this.findProducts({
      where: { property: '_id', propResult: id },
    });

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
    const product = await this.findProducts({
      where: { property: '_id', propResult: id },
    });

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
    const product = await ProductModel.findByIdAndDelete(id);
    return product;
  },
};
