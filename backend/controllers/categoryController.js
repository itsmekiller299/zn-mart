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
        if (global.USE_MOCK_DB || mongoose.connection.readyState !== 1) {
            const newCat = {
                _id: new mongoose.Types.ObjectId().toString(),
                name: req.body.name,
                description: req.body.description,
                image: req.body.image || { url: '/images/product1.png', public_id: `mock_cat_${Date.now()}` },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            mockData.categories.push(newCat);
            return res.status(201).json({ success: true, data: newCat });
        }
        const category = await Category.create(req.body);
        res.status(201).json({ success: true, data: category });
    } catch (err) {
        next(err);
    }
};
