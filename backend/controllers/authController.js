const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });

    res.status(statusCode).json({
        success: true,
        token,
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    });
};

// In-memory mock users for Vercel demo (persists per serverless container)
const mockUsers = [
    { _id: 'mock_admin_id', name: 'Admin User', email: 'admin@znmart.com', password: 'password123', role: 'admin' }
];

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    try {
        // Mock fallback for Vercel without DB (prevents buffering timeout)
        if (global.USE_MOCK_DB || require('mongoose').connection.readyState !== 1) {
            const { name, email, password } = req.body;
            if (!name || !email || !password) {
                return res.status(400).json({ success: false, message: 'Please provide name, email and password' });
            }
            if (mockUsers.find(u => u.email === email)) {
                return res.status(400).json({ success: false, message: 'Email already exists' });
            }
            if (password.length < 6) {
                return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
            }
            const mockUser = { _id: 'mock_' + Date.now(), name, email, role: 'user' };
            mockUsers.push({ ...mockUser, password });
            const token = jwt.sign({ id: mockUser._id }, process.env.JWT_SECRET || 'zn_mart_super_secret_dev_key_2026', { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
            return res.status(201).json({ success: true, token, user: mockUser });
        }

        const { name, email, password } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }

        // Create user
        user = await User.create({
            name,
            email,
            password
        });

        sendTokenResponse(user, 201, res);
    } catch (err) {
        next(err);
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        // Mock fallback for Vercel without DB
        if (global.USE_MOCK_DB || require('mongoose').connection.readyState !== 1) {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ success: false, message: 'Please provide an email and password' });
            }
            // Check mockUsers store first (for users registered via mock register)
            const existingMock = mockUsers.find(u => u.email === email);
            if (existingMock) {
                if (existingMock.password !== password) {
                    return res.status(401).json({ success: false, message: 'Invalid credentials' });
                }
                const mockUser = { _id: existingMock._id, name: existingMock.name, email: existingMock.email, role: existingMock.role };
                const token = jwt.sign({ id: mockUser._id }, process.env.JWT_SECRET || 'zn_mart_super_secret_dev_key_2026', { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
                return res.status(200).json({ success: true, token, user: mockUser });
            }
            // Fallback: allow any password123 for demo (legacy)
            if (password === 'password123') {
                const mockUser = { _id: 'mock_' + Date.now(), name: email.split('@')[0], email: email, role: email === 'admin@znmart.com' ? 'admin' : 'user' };
                // Persist for future logins
                mockUsers.push({ ...mockUser, password });
                const token = jwt.sign({ id: mockUser._id }, process.env.JWT_SECRET || 'zn_mart_super_secret_dev_key_2026', { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
                return res.status(200).json({ success: true, token, user: mockUser });
            }
            return res.status(401).json({ success: false, message: 'Invalid credentials (mock mode: use password123 or register first)' });
        }
        const { email, password } = req.body;

        // Validate email & password
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide an email and password' });
        }

        // Check for user
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        sendTokenResponse(user, 200, res);
    } catch (err) {
        next(err);
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
    try {
        if (global.USE_MOCK_DB || require('mongoose').connection.readyState !== 1) {
            // Return mock user from token
            const mock = mockUsers.find(u => u._id === req.user.id) || req.user;
            return res.status(200).json({ success: true, data: mock });
        }
        const user = await User.findById(req.user.id);
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        next(err);
    }
};
