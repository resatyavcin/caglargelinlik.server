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
  const { productName } = req.query;
  try {
    const products = await productService.findProducts({
      code: productCode,
      options: {
        findMethod: '$and',
      },
      where: { property: 'name', propResult: productName },
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

async function rentProduct(req, res, next) {
  try {
    const productId = req.params.productId;
    const updatedProduct = await productService.rentProduct(productId);

    res.status(200).json({
      status: responseJSON(status[200], status['200_MESSAGE']),
      result: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
}

async function receivingTheRentedProductBack(req, res, next) {
  try {
    const productId = req.params.productId;
    const updatedProduct =
      await productService.receivingTheRentedProductBack(productId);

    res.status(200).json({
      status: responseJSON(status[200], status['200_MESSAGE']),
      result: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
}

async function cancelRentProduct(req, res, next) {
  try {
    const productId = req.params.productId;
    const updatedProduct = await productService.cancelRentProduct(productId);

    res.status(200).json({
      status: responseJSON(status[200], status['200_MESSAGE']),
      result: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
}

async function sellProduct(req, res, next) {
  try {
    const productId = req.params.productId;
    const updatedProduct = await productService.sellProduct(productId);

    res.status(200).json({
      status: responseJSON(status[200], status['200_MESSAGE']),
      result: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
}

async function cancelSellProduct(req, res, next) {
  try {
    const productId = req.params.productId;
    const updatedProduct = await productService.cancelSellProduct(productId);

    res.status(200).json({
      status: responseJSON(status[200], status['200_MESSAGE']),
      result: updatedProduct,
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
  rentProduct,
  receivingTheRentedProductBack,
  cancelRentProduct,
  sellProduct,
  cancelSellProduct,
  deleteProduct,
  getProductNames,
  getProductCount,
};
