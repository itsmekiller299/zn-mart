const express = require('express');
const { getAllOrders, updateOrderStatus, confirmOrder, getAllUsers, getCustomerStats } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.post('/orders/:id/confirm', confirmOrder);
router.get('/users', getAllUsers);
router.get('/stats', getCustomerStats);

module.exports = router;
