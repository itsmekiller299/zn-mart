const Cart = require('../models/Cart');

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res, next) => {
    try {
        let cart = await Cart.findOne({ user: req.user.id }).populate('items.product', 'name price images');
        
        if (!cart) {
            cart = await Cart.create({ user: req.user.id, items: [] });
        }
        
        res.status(200).json({ success: true, data: cart });
    } catch (err) {
        next(err);
    }
};

// @desc    Add/Update item in cart
// @route   POST /api/cart
// @access  Private
exports.updateCart = async (req, res, next) => {
    try {
        const { product, quantity } = req.body;
        
        let cart = await Cart.findOne({ user: req.user.id });
        
        if (!cart) {
            cart = await Cart.create({
                user: req.user.id,
                items: [{ product, quantity }]
            });
        } else {
            const itemIndex = cart.items.findIndex(item => item.product.toString() === product);
            
            if (itemIndex > -1) {
                // Update quantity
                cart.items[itemIndex].quantity = quantity;
            } else {
                // Add new item
                cart.items.push({ product, quantity });
            }
            await cart.save();
        }
        
        cart = await cart.populate('items.product', 'name price images');
        res.status(200).json({ success: true, data: cart });
    } catch (err) {
        next(err);
    }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
exports.removeFromCart = async (req, res, next) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id });
        
        if (!cart) {
            return res.status(404).json({ success: false, message: 'Cart not found' });
        }
        
        cart.items = cart.items.filter(item => item.product.toString() !== req.params.productId);
        await cart.save();
        
        await cart.populate('items.product', 'name price images');
        res.status(200).json({ success: true, data: cart });
    } catch (err) {
        next(err);
    }
};
