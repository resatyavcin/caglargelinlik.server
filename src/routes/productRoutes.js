const express = require('express');
const router = express.Router();

const productController = require('../controllers/productController');

router.post('/createProduct', productController.createProduct);
router.get('/getProducts/:productCode', productController.getProducts);
router.get('/getProductCount/:productCode', productController.getProductCount);
router.get('/getProductNames/:productCode', productController.getProductNames);
router.delete('/deleteProduct/:productId', productController.deleteProduct);

router.put('/rentProduct/:productId', productController.rentProduct);
router.put(
  '/cancelRentProduct/:productId',
  productController.cancelRentProduct,
);
router.put(
  '/receiving/:productId',
  productController.receivingTheRentedProductBack,
);

router.put('/sellProduct/:productId', productController.sellProduct);
router.put(
  '/cancelSellProduct/:productId',
  productController.cancelSellProduct,
);

module.exports = router;
