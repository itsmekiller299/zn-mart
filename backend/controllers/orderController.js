const Order = require('../models/Order');
const mongoose = require('mongoose');
const mockData = { orders: [] }; // simple in-memory mock for Vercel demo without DB
const { sendOrderConfirmation } = require('../utils/sendEmail');
const mockOrdersStore = require('../utils/mockOrdersStore');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
    try {
        const {
            items,
            shippingAddress,
            paymentInfo,
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice
        } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, message: 'No order items' });
        }

        // Normalize payment method: default 'card', allow 'cod'
        const method = (paymentMethod || paymentInfo?.method || 'card').toLowerCase();
        if (!['card', 'cod'].includes(method)) {
            return res.status(400).json({ success: false, message: 'Invalid payment method. Use card or cod' });
        }

        // Build paymentInfo based on method
        let finalPaymentInfo = paymentInfo || {};
        if (method === 'cod') {
            finalPaymentInfo = {
                id: 'COD-' + Date.now(),
                status: 'pending',
                method: 'cod'
            };
        } else {
            // Card: require mock id/status or treat as paid in sandbox
            finalPaymentInfo = {
                id: paymentInfo?.id || 'card_' + Date.now(),
                status: paymentInfo?.status || 'paid',
                method: 'card'
            };
        }

        // Mock fallback for Vercel without DB
        if (global.USE_MOCK_DB || mongoose.connection.readyState !== 1) {
            const mockOrder = {
                _id: new mongoose.Types.ObjectId().toString(),
                user: req.user._id || req.user.id,
                userEmail: req.user.email,
                userName: req.user.name,
                items,
                shippingAddress,
                paymentMethod: method,
                paymentInfo: finalPaymentInfo,
                isPaid: method === 'card',
                paidAt: method === 'card' ? new Date().toISOString() : undefined,
                taxPrice: taxPrice || 0,
                shippingPrice: shippingPrice || 0,
                totalPrice: totalPrice || itemsPrice || 0,
                status: 'Processing',
                createdAt: new Date().toISOString(),
            };
            mockData.orders.push(mockOrder);
            mockOrdersStore.add(mockOrder);
            // Send confirmation email (mock logs, non-blocking)
            const email = req.user.email || shippingAddress?.email;
            if (email) {
                sendOrderConfirmation(mockOrder, email, req.user.name).catch(() => {});
            }
            return res.status(201).json({ success: true, data: mockOrder });
        }

        const order = await Order.create({
            user: req.user._id || req.user.id,
            items,
            shippingAddress,
            paymentMethod: method,
            paymentInfo: finalPaymentInfo,
            isPaid: method === 'card' ? true : false,
            paidAt: method === 'card' ? Date.now() : undefined,
            taxPrice: taxPrice || 0,
            shippingPrice: shippingPrice || 0,
            totalPrice: totalPrice || itemsPrice || 0
        });

        // Send confirmation email from znmart07@gmail.com
        try {
            const User = require('../models/User');
            const user = await User.findById(order.user).select('name email');
            const email = user?.email || req.user.email;
            if (email) await sendOrderConfirmation(order, email, user?.name || req.user.name);
        } catch (e) { console.error('Order email failed', e.message); }

        res.status(201).json({ success: true, data: order });
    } catch (err) {
        next(err);
    }
};
exports.mockData = mockData;

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
exports.getMyOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ user: req.user.id }).sort('-createdAt');
        res.status(200).json({ success: true, count: orders.length, data: orders });
    } catch (err) {
        next(err);
    }
};
