const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
router.post("/google/callback", authController.googleAuthCallback);
router.post('/logout', authController.logout);
router.get('/me', authMiddleware, authController.me);
module.exports = router;