const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const mongoose = require('mongoose');
const mockData = require('../utils/mockData');
const { sendAdminConfirmation } = require('../utils/sendEmail');

// @desc Get all orders (admin) - mock returns sample + dynamic orders so admin never sees empty
exports.getAllOrders = async (req, res, next) => {
  try {
    if (global.USE_MOCK_DB || mongoose.connection.readyState !== 1) {
      const mockOrdersStore = require('../utils/mockOrdersStore');
      const stored = mockOrdersStore.getAll();
      const { mockData: orderMock } = require('./orderController');
      // Merge stored + in-memory orderMock
      const seen = new Set(stored.map(o => String(o._id)));
      orderMock.orders.forEach(o => {
        if (!seen.has(String(o._id))) stored.push(o);
      });
      // Sample orders for demo when no dynamic orders yet
      const sampleOrders = stored.length ? [] : [
        {
          _id: '6a9f1b36ff6e5ee79c9b36b5',
          user: { _id: 'mock_user1', name: 'Rahul Sharma', email: 'rahul@example.com' },
          userEmail: 'rahul@example.com',
          userName: 'Rahul Sharma',
          items: [{ product: '6a9b8883c4a92a5ddf7d5f05', name: 'Premium Wireless Headphones', quantity: 1, price: 199.99, image: '/images/product1.png' }],
          shippingAddress: { street: '123 MG Road', city: 'Mumbai', state: 'MH', zipCode: '400001', country: 'India', phone: '9876543210', fullName: 'Rahul Sharma', email: 'rahul@example.com' },
          paymentMethod: 'cod',
          paymentInfo: { id: 'COD- demo1', status: 'pending', method: 'cod' },
          totalPrice: 199.99,
          status: 'Processing',
          createdAt: new Date(Date.now() - 1000*60*60*2).toISOString()
        },
        {
          _id: '6a9f1b36ff6e5ee79c9b36b6',
          user: { _id: 'mock_user2', name: 'Priya Mehta', email: 'priya@example.com' },
          userEmail: 'priya@example.com',
          userName: 'Priya Mehta',
          items: [{ product: '6a9b8883c4a92a5ddf7d5f06', name: 'Luxury Classic Watch', quantity: 1, price: 299.99, image: '/images/product2.png' }],
          shippingAddress: { street: '45 Park Street', city: 'Delhi', state: 'DL', zipCode: '110001', country: 'India', phone: '9876543211', fullName: 'Priya Mehta', email: 'priya@example.com' },
          paymentMethod: 'card',
          paymentInfo: { id: 'card_demo2', status: 'paid', method: 'card' },
          totalPrice: 299.99,
          status: 'Shipped',
          createdAt: new Date(Date.now() - 1000*60*60*5).toISOString()
        }
      ];
      const allOrders = [...stored, ...sampleOrders];
      return res.status(200).json({ success: true, count: allOrders.length, data: allOrders });
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
      const mockOrdersStore = require('../utils/mockOrdersStore');
      const all = mockOrdersStore.getAll();
      const order = all.find(o => String(o._id) === String(req.params.id));
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
      order.status = status;
      if (status === 'Delivered') order.deliveredAt = new Date().toISOString();
      mockOrdersStore.save(all);
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
      const mockOrdersStore = require('../utils/mockOrdersStore');
      const all = mockOrdersStore.getAll();
      const order = all.find(o => String(o._id) === String(req.params.id));
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
      order.status = 'Processing';
      mockOrdersStore.save(all);
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
