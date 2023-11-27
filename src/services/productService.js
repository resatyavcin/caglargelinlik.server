const ProductModel = require('../models/Product');

module.exports = {
  create: async function ({
    code,
    name,
    quantity,
    isSecondHand,
    isSold,
    isActive,
  }) {
    const product = new ProductModel({
      code,
      name,
      quantity,
      isSecondHand,
      isSold,
      isActive,
    });

    // if (isExist) {
    //   throw new Error('Ürün stoklarda mevcut. Tekrar oluşturulamaz.');
    //   return;
    // }

    return product.save();
  },

  findProducts: async function ({ code, where, options, paginable = true }) {
    let currentWhereQuery = {};
    let isPaginate = paginable;
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

    const queryBuilder = await ProductModel.find(query);

    if (isPaginate) {
      products = await queryBuilder
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    }

    const products = await queryBuilder.exec();

    if (!products) {
      throw new Error('Ürün bulunamadı');
      return;
    }

    return products.length > 1 ? products : product[0];
  },

  displayProductNames: async function ({ code, name }) {
    console.log(code, name);
    const product = await ProductModel.findOne({ $and: [{ code }, { name }] });
    return product;
  },

  getCountProductAsCodeAndName: async function ({ code }) {
    const countProduct = await ProductModel.countDocuments({ code });
    return countProduct;
  },

  update: async function ({ code, id, props }) {
    const product = await this.findProducts({
      code,
      where: { property: _id, propResult: id },
    });

    Object.assign(product, props);

    await product.save();
  },
  delete: async function () {},
};
