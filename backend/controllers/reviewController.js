const Review = require('../models/Review');
const Product = require('../models/Product');

// @desc    Get reviews
// @route   GET /api/reviews
// @route   GET /api/products/:productId/reviews
// @access  Public
exports.getReviews = async (req, res, next) => {
    try {
        let query;

        if (req.params.productId) {
            query = Review.find({ product: req.params.productId });
        } else {
            query = Review.find().populate({
                path: 'product',
                select: 'name description'
            });
        }

        const reviews = await query;

        res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Add review
// @route   POST /api/products/:productId/reviews
// @access  Private
exports.addReview = async (req, res, next) => {
    try {
        req.body.product = req.params.productId;
        req.body.user = req.user.id;

        const product = await Product.findById(req.params.productId);

        if (!product) {
            return res.status(404).json({ success: false, message: `No product with the id of ${req.params.productId}` });
        }

        const review = await Review.create(req.body);

        res.status(201).json({
            success: true,
            data: review
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ success: false, message: 'You have already submitted a review for this product' });
        }
        next(err);
    }
};
