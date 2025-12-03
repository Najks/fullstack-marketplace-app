const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { validateCreateUser, validateUpdateUser } = require('../middlewares/userValidation');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUser);
router.post('/', validateCreateUser, userController.createUser);
router.put('/:id', validateUpdateUser, userController.updateUser);
router.delete('/:id', userController.deleteUser);

router.post('/:userId/favorites/:productId', authMiddleware, userController.createFavouriteProduct);
router.get('/:userId/favorites', userController.getFavouriteProducts);
router.delete('/:userId/favorites/:productId', authMiddleware, userController.deleteFavouriteProduct);
module.exports = router;
