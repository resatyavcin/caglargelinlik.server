const express = require('express');
const router = express.Router();

const productController = require('../controllers/productController');

router.post('/createProduct', productController.createProduct);
router.get('/getProducts/:productCode', productController.getProducts);
router.get('/getProductCount/:productCode', productController.getProductCount);
router.get('/getProductNames/:productCode', productController.getProductNames);
router.put('/updateProduct/:productId', productController.updateProduct);
router.delete('/deleteProduct/:productId', productController.deleteProduct);

module.exports = router;
