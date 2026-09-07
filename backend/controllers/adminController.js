const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const mongoose = require('mongoose');
const mockData = require('../utils/mockData');
const { sendAdminConfirmation } = require('../utils/sendEmail');

// @desc Get all orders (admin)
exports.getAllOrders = async (req, res, next) => {
  try {
    if (global.USE_MOCK_DB || mongoose.connection.readyState !== 1) {
      const { mockData: orderMock } = require('./orderController');
      return res.status(200).json({ success: true, count: orderMock.orders.length, data: orderMock.orders });
    }
    const orders = await Order.find().populate('user', 'name email').populate('items.product', 'name').sort('-createdAt');
    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (err) { next(err); }
};

// @desc Update order status (admin) + send email
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['Processing','Shipped','Delivered','Cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    if (global.USE_MOCK_DB || mongoose.connection.readyState !== 1) {
      const { mockData: orderMock } = require('./orderController');
      const order = orderMock.orders.find(o => String(o._id) === String(req.params.id));
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
      order.status = status;
      if (status === 'Delivered') order.deliveredAt = new Date().toISOString();
      // Send email to customer
      const email = order.userEmail || order.shippingAddress?.email || order.user?.email;
      const phone = order.shippingAddress?.phone;
      const name = order.userName || order.user?.name || 'Customer';
      if (email) sendAdminConfirmation(order, email, name, phone).catch(() => {});
      return res.status(200).json({ success: true, data: order, emailSent: !!email });
    }
    const order = await Order.findByIdAndUpdate(req.params.id, { status, ...(status==='Delivered' ? { deliveredAt: Date.now() } : {}) }, { new: true, runValidators: true }).populate('user', 'name email');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    // Send email via znmart07@gmail.com
    try {
      const email = order.user?.email || order.shippingAddress?.email;
      const phone = order.shippingAddress?.phone;
      if (email) await sendAdminConfirmation(order, email, order.user?.name, phone);
    } catch (e) { console.error('Status email failed', e.message); }
    res.status(200).json({ success: true, data: order });
  } catch (err) { next(err); }
};

// @desc Confirm order & send success email/SMS (admin)
exports.confirmOrder = async (req, res, next) => {
  try {
    const { email, phone } = req.body; // optional override
    if (global.USE_MOCK_DB || mongoose.connection.readyState !== 1) {
      const { mockData: orderMock } = require('./orderController');
      const order = orderMock.orders.find(o => String(o._id) === String(req.params.id));
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
      order.status = 'Processing';
      const toEmail = email || order.userEmail || order.shippingAddress?.email || order.user?.email;
      const toPhone = phone || order.shippingAddress?.phone;
      const toName = order.userName || order.user?.name || 'Customer';
      if (!toEmail && !toPhone) return res.status(400).json({ success: false, message: 'No email/phone for customer' });
      let emailResult = null;
      if (toEmail) emailResult = await sendAdminConfirmation(order, toEmail, toName, toPhone);
      console.log(`Admin confirmed order ${order._id} -> ${toEmail} ${toPhone}`);
      return res.status(200).json({ success: true, data: order, message: `Your order can be placed successfully! Confirmation sent to ${toEmail || toPhone} from znmart07@gmail.com`, emailResult });
    }
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    order.status = 'Processing';
    await order.save();
    const toEmail = email || order.user?.email || order.shippingAddress?.email;
    const toPhone = phone || order.shippingAddress?.phone;
    const toName = order.user?.name || 'Customer';
    if (toEmail) await sendAdminConfirmation(order, toEmail, toName, toPhone);
    res.status(200).json({ success: true, data: order, message: `Your order can be placed successfully! Sent to ${toEmail || toPhone} from znmart07@gmail.com` });
  } catch (err) { next(err); }
};

// @desc Get all users/customers (admin)
exports.getAllUsers = async (req, res, next) => {
  try {
    if (global.USE_MOCK_DB || mongoose.connection.readyState !== 1) {
      const mockUsers = [
        { _id: 'mock_admin_id', name: 'Admin User', email: 'admin@znmart.com', role: 'admin', createdAt: new Date().toISOString() },
        { _id: 'mock_user1', name: 'Rahul Sharma', email: 'rahul@example.com', role: 'user', createdAt: new Date().toISOString() },
        { _id: 'mock_user2', name: 'Priya Mehta', email: 'priya@example.com', role: 'user', createdAt: new Date().toISOString() },
      ];
      return res.status(200).json({ success: true, count: mockUsers.length, data: mockUsers });
    }
    const users = await User.find().select('-password').sort('-createdAt');
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (err) { next(err); }
};

// @desc Get customer service stats (admin)
exports.getCustomerStats = async (req, res, next) => {
  try {
    if (global.USE_MOCK_DB || mongoose.connection.readyState !== 1) {
      return res.status(200).json({ success: true, data: { totalCustomers: 2, totalOrders: 5, pendingOrders: 2, deliveredOrders: 3, totalProducts: mockData.products.length, openTickets: 2 } });
    }
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
