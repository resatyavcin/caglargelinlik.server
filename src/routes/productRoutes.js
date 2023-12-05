const express = require('express');
const router = express.Router();

const productController = require('../controllers/productController');
const { isDateRangeIntersection } = require('../utils');

router.post('/createProduct', productController.createProduct);
router.get('/test', (req, res) => {
  res.send(
    isDateRangeIntersection(
      req.body.startDate1,
      req.body.endDate1,
      req.body.startDate2,
      req.body.endDate2,
    ),
  );
});
router.get('/getProducts/:productCode', productController.getProducts);
router.get('/getProductNames/:productCode', productController.getProductNames);
router.delete('/deleteProduct/:productId', productController.deleteProduct);

router.put('/rentProduct/:productCode', productController.rentProduct);
router.put('/cancelRentProduct', productController.cancelRentProduct);
router.put('/receiving', productController.receivingTheRentedProductBack);

router.put('/sellProduct/:productId', productController.sellProduct);
router.put(
  '/cancelSellProduct/:productId',
  productController.cancelSellProduct,
);

module.exports = router;
