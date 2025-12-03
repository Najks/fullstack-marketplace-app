const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');

const {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getUserProducts,
    getProductsByCategory,
    searchAndFilterProducts,
    productCountByCategory,
    productCountByUser,
    getUsersSoldProducts
} = require('../controllers/productController');

router.get('/search-filter', searchAndFilterProducts);
router.get('/myproducts/:userId', getUserProducts);
router.get('/category/:categoryId', getProductsByCategory);
router.get('/category/:categoryId/count', productCountByCategory);
router.get('/user/:userId/count', productCountByUser)

router.post('/', upload.array('images', 10), createProduct);
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.put('/:id', upload.array('images', 10), updateProduct);
router.delete('/:id', deleteProduct);
router.get("/:userId/sold", getUsersSoldProducts );

module.exports = router;
