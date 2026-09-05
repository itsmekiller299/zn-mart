const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

// @desc Get all orders (admin)
// @route GET /api/orders
exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().populate('user', 'name email').populate('items.product', 'name').sort('-createdAt');
    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (err) { next(err); }
};

// @desc Update order status (admin)
// @route PUT /api/orders/:id/status
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['Processing','Shipped','Delivered','Cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const order = await Order.findByIdAndUpdate(req.params.id, { status, ...(status==='Delivered' ? { deliveredAt: Date.now() } : {}) }, { new: true, runValidators: true });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.status(200).json({ success: true, data: order });
  } catch (err) { next(err); }
};

// @desc Get all users/customers (admin)
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt');
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (err) { next(err); }
};

// @desc Get customer service stats (admin)
exports.getCustomerStats = async (req, res, next) => {
  try {
    const totalCustomers = await User.countDocuments({ role: 'user' });
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'Processing' });
    const deliveredOrders = await Order.countDocuments({ status: 'Delivered' });
    const totalProducts = await Product.countDocuments();
    // Mock tickets (since no model yet) – derived from pending orders
    const openTickets = pendingOrders;
    res.status(200).json({
      success: true,
      data: { totalCustomers, totalOrders, pendingOrders, deliveredOrders, totalProducts, openTickets }
    });
  } catch (err) { next(err); }
};
