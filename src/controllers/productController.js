const status = require('http-status');
const { responseJSON } = require('../utils');
const { productService } = require('../services');

async function createProduct(req, res, next) {
  const { code, name, isSecondHand } = req.body;
  try {
    const product = await productService.create({
      code,
      name,
      isSecondHand,
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

async function rentProduct(req, res, next) {
  try {
    const productCode = req.params.productCode;
    const { productName } = req.query;

    const { isPackage, startDate, endDate } = req.body;

    const updatedProduct = await productService.rentProduct({
      code: productCode,
      name: productName,
      startDate,
      endDate,
      isPackage,
    });

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
    const booking = req.query.booking;
    const updatedProduct = await productService.receivingTheRentedProductBack({
      booking,
    });

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
    const booking = req.query.booking;
    const updatedProduct = await productService.cancelRentProduct({ booking });

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
};
