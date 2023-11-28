const status = require('http-status');
const { responseJSON } = require('../utils');
const { productService } = require('../services');

async function createProduct(req, res, next) {
  const { code, name, quantity, isSecondHand, isSold, isActive } = req.body;
  try {
    const product = await productService.create({
      code,
      name,
      quantity,
      isSecondHand,
      isSold,
      isActive,
    });

    return res.status(201).json({
      result: product,
      status: responseJSON(status[201], status['201_MESSAGE']),
    });
  } catch (error) {
    next(error);
  }
}

async function getProducts(req, res, next) {
  const { productCode } = req.params;
  const { currentPage, perPage } = req.query;
  try {
    const products = await productService.findProducts({
      code: productCode,
      options: { currentPage, perPage },
      paginable: true,
    });

    return res.status(200).json({
      result: products,
      status: responseJSON(status[200], status['200_MESSAGE']),
    });
  } catch (error) {
    next(error);
  }
}

async function getProductNames(req, res, next) {
  const { productCode } = req.params;

  try {
    const products = await productService.displayProductNames({
      code: productCode,
    });
    return res.status(200).json({
      result: products,
      status: responseJSON(status[200], status['200_MESSAGE']),
    });
  } catch (error) {
    next(error);
  }
}

async function getProductCount(req, res, next) {
  const { productCode } = req.params;
  const { productName } = req.query;

  try {
    const productsLength = await productService.getCountProductAsCodeAndName({
      code: productCode,
      name: productName,
    });
    return res.status(200).json({
      result: productsLength,
      status: responseJSON(status[200], status['200_MESSAGE']),
    });
  } catch (error) {
    next(error);
  }
}

async function updateProduct(req, res, next) {
  try {
    const productId = req.params.productId;
    const product = await ProductModel.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Ürün bulunamadı' });
    }
    const wasFirstHand = product.isSecondHand === false;

    if (wasFirstHand) {
      if (req.body.isRentable && req.body.isReturned) {
        product.isSecondHand = true;
      } else if (req.body.isRentable && req.body.isGiven) {
        product.isActive = true;
      } else if (req.body.isForSale) {
        product.isSold = true;
      }
    } else {
      if (req.body.isRentable && req.body.isReturned) {
        product.isActive = false;
      } else if (req.body.isRentable && req.body.isGiven) {
        product.isActive = true;
      } else if (req.body.isForSale) {
        product.isSold = true;
      }
    }

    await productService.update({});

    res.status(200).json({
      status: responseJSON(status[200], status['200_MESSAGE']),
      result: product,
    });
  } catch (error) {
    next(error);
  }
}

async function deleteProduct(req, res, next) {
  const productId = req.params.productId;

  try {
    const deletedProduct = await productService.delete({ id: productId });
    return res.status(200).json({
      result: deletedProduct,
      status: responseJSON(status[200], status['200_MESSAGE']),
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  getProductNames,
  getProductCount,
};
