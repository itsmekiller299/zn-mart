const Product = require('../models/Product');
const mongoose = require('mongoose');
const mockData = require('../utils/mockData');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res, next) => {
    try {
        // Mock fallback for Vercel without DB
        if (global.USE_MOCK_DB || mongoose.connection.readyState !== 1) {
            let data = [...mockData.products];
            if (req.query.keyword) {
                const kw = req.query.keyword.toLowerCase();
                data = data.filter(p => p.name.toLowerCase().includes(kw) || p.description.toLowerCase().includes(kw));
            }
            if (req.query.category) {
                data = data.filter(p => String(p.category._id) === String(req.query.category) || String(p.category) === String(req.query.category));
            }
            return res.status(200).json({ success: true, count: data.length, pagination: {}, data });
        }

        let query;
        const reqQuery = { ...req.query };

        // Fields to exclude from filtering
        const removeFields = ['select', 'sort', 'page', 'limit', 'keyword'];
        removeFields.forEach(param => delete reqQuery[param]);

        // Create query string
        let queryStr = JSON.stringify(reqQuery);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

        // Finding resource
        let parsedQuery = JSON.parse(queryStr);

        // Search by keyword
        if (req.query.keyword) {
            parsedQuery.$text = { $search: req.query.keyword };
        }

        query = Product.find(parsedQuery).populate('category', 'name');

        // Select Fields
        if (req.query.select) {
            const fields = req.query.select.split(',').join(' ');
            query = query.select(fields);
        }

        // Sort
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }

        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = await Product.countDocuments(parsedQuery);

        query = query.skip(startIndex).limit(limit);

        // Executing query
        const products = await query;

        // Pagination result
        const pagination = {};
        if (endIndex < total) {
            pagination.next = { page: page + 1, limit };
        }
        if (startIndex > 0) {
            pagination.prev = { page: page - 1, limit };
        }

        res.status(200).json({
            success: true,
            count: products.length,
            pagination,
            data: products
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res, next) => {
    try {
        if (global.USE_MOCK_DB || mongoose.connection.readyState !== 1) {
            const product = mockData.products.find(p => p._id === req.params.id);
            if (!product) return res.status(404).json({ success: false, message: `Product not found with id of ${req.params.id}` });
            return res.status(200).json({ success: true, data: product });
        }
        const product = await Product.findById(req.params.id).populate('category', 'name description');

        if (!product) {
            return res.status(404).json({ success: false, message: `Product not found with id of ${req.params.id}` });
        }

        res.status(200).json({ success: true, data: product });
    } catch (err) {
        next(err);
    }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res, next) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json({ success: true, data: product });
    } catch (err) {
        next(err);
    }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res, next) => {
    try {
        let product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, message: `Product not found with id of ${req.params.id}` });
        }

        product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: product });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, message: `Product not found with id of ${req.params.id}` });
        }

        await product.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        next(err);
    }
};
