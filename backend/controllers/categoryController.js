const Category = require('../models/Category');
const mongoose = require('mongoose');
const mockData = require('../utils/mockData');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = async (req, res, next) => {
    try {
        if (global.USE_MOCK_DB || mongoose.connection.readyState !== 1) {
            return res.status(200).json({ success: true, count: mockData.categories.length, data: mockData.categories });
        }
        const categories = await Category.find();
        res.status(200).json({ success: true, count: categories.length, data: categories });
    } catch (err) {
        next(err);
    }
};

// @desc    Create category
// @route   POST /api/categories
// @access  Private/Admin
exports.createCategory = async (req, res, next) => {
    try {
        const category = await Category.create(req.body);
        res.status(201).json({ success: true, data: category });
    } catch (err) {
        next(err);
    }
};
