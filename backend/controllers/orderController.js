const Order = require('../models/Order');
const mongoose = require('mongoose');
const mockData = { orders: [] }; // simple in-memory mock for Vercel demo without DB

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

        res.status(201).json({ success: true, data: order });
    } catch (err) {
        next(err);
    }
};

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
