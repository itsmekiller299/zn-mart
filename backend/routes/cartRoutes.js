const express = require('express');
const { getCart, updateCart, removeFromCart } = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getCart)
    .post(updateCart);

router.route('/:productId')
    .delete(removeFromCart);

module.exports = router;
