const status = require('http-status');
const { responseJSON } = require('../utils');
const { productService } = require('../services');
const productSchema = require('../models/Product');

async function createProduct(req, res, next) {
  const { code, name, isSecondHand, specialCode } = req.body;
  try {
    const product = await productService.create({
      code,
      name,
      isSecondHand,
      specialCode,
    });

    return res.status(201).json({
      result: product,
      status: responseJSON(status[201], status['201_MESSAGE']),
    });
  } catch (error) {
    next(error);
  }
}

async function getProductOne(req, res, next) {
  const { productId } = req.params;

  if (!productId) {
    throw new Error('productId giriniz');
  }
  try {
    const products = await productSchema.findOne({ _id: productId });

    return res.status(200).json({
      result: products,
      status: responseJSON(status[200], status['200_MESSAGE']),
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
    const { productName, productSpecialCode } = req.query;

    const { isPackage, startDate, endDate } = req.body;

    const updatedProduct = await productService.rentProduct({
      code: productCode,
      name: productName,
      startDate,
      endDate,
      isPackage,
      productSpecialCode,
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
      result: {
        data: updatedProduct,
        message: 'Başarı ile ürün geri teslim alındı ve durumu güncellendi.',
      },
    });
  } catch (error) {
    next(error);
  }
}

async function receivingTheRentedProductBackCancel(req, res, next) {
  try {
    const booking = req.query.booking;
    const updatedProduct =
      await productService.receivingTheRentedProductBackCancel({
        booking,
      });

    res.status(200).json({
      status: responseJSON(status[200], status['200_MESSAGE']),
      result: {
        data: updatedProduct,
        message:
          'Başarı ile ürün geri teslim alma iptal edildi ve ürün durumu güncellendi.',
      },
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
    const productCode = req.params.productCode;
    const productName = req.query.productName;
    const specialCode = req.query.specialCode;
    const date = req.body.date;
    const updatedProduct = await productService.sellProduct({
      productCode,
      productName,
      date,
      specialCode,
    });

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
    const productCode = req.params.productCode;
    const productName = req.query.productName;
    const booking = req.query.booking;

    const updatedProduct = await productService.cancelSellProduct({
      productCode,
      productName,
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

async function deleteProduct(req, res, next) {
  const productId = req.params.productId;

  try {
    const deletedProduct = await productService.delete({ productId });
    return res.status(200).json({
      result: {
        message: 'Ürün başarı ile silindi.',
        product: deletedProduct,
      },
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
  getProductOne,
  receivingTheRentedProductBackCancel,
};
