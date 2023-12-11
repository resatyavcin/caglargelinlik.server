const express = require('express');
const router = express.Router();

const productController = require('../controllers/productController');

router.post('/createProduct', productController.createProduct);
router.get('/getProducts/:productCode', productController.getProducts);
router.get('/getProductOne/:productId', productController.getProductOne);
router.get('/getProductNames/:productCode', productController.getProductNames);
router.get(
  '/getProductSpecialCodes/:productCode',
  productController.getDisplayCodes,
);
router.delete('/deleteProduct/:productId', productController.deleteProduct);

router.put('/rentProduct/:productCode', productController.rentProduct);
router.put('/cancelRentProduct', productController.cancelRentProduct);
router.put('/receiving', productController.receivingTheRentedProductBack);
router.put(
  '/receiving-cancel',
  productController.receivingTheRentedProductBackCancel,
);

router.put('/sellProduct/:productCode', productController.sellProduct);
router.put(
  '/cancelSellProduct/:productCode',
  productController.cancelSellProduct,
);

module.exports = router;
