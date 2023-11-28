const ProductModel = require('../models/Product');
const { findByIdAndDelete } = require('../models/User');

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

  findProducts: async function ({ code, where, options, paginable = false }) {
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
      throw new Error('Geçersiz Sayfa Numarası');
    }

    let queryBuilder = ProductModel.find(query);

    if (isPaginate) {
      queryBuilder = await queryBuilder
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    }

    products = queryBuilder;

    if (!products) {
      throw new Error('Ürün bulunamadı');
      return;
    }

    return products.length > 1 ? products : products[0];
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

  update: async function ({ id, props }) {
    const product = await this.findProducts({
      where: { property: _id, propResult: id },
    });

    const { code, ...rest } = props;

    Object.assign(product, rest);

    await product.save();
  },
  delete: async function ({ id }) {
    const product = await ProductModel.findByIdAndDelete(id);
    return product;
  },
};
