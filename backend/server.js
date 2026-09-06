require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const app = express();

// Fix for Vercel deployment: trust proxy for rate-limit + use /tmp for mongodb-memory-server
if (process.env.VERCEL) {
    process.env.HOME = '/tmp';
    process.env.MONGOMS_DOWNLOAD_DIR = '/tmp/mongodb';
    process.env.MONGOMS_VERSION = process.env.MONGOMS_VERSION || '7.0.14';
}
app.set('trust proxy', 1);

// Security Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            baseUri: ["'self'"],
            fontSrc: ["'self'", "https:", "data:"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "https:", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:", "https://res.cloudinary.com", "https://via.placeholder.com"],
            connectSrc: ["'self'", process.env.FRONTEND_URL || "http://localhost:5173", "https://*.vercel.app"],
            frameAncestors: ["'self'"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
        }
    },
    crossOriginEmbedderPolicy: false,
}));
// Warn if JWT_SECRET is weak in production
if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'zn_mart_super_secret_dev_key_2026')) {
    console.warn('WARNING: JWT_SECRET is not set or is default value – set a strong secret in production!');
}
const allowedOrigins = process.env.FRONTEND_URL ? [process.env.FRONTEND_URL, process.env.FRONTEND_URL.replace('localhost','127.0.0.1')] : [];
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, Postman)
        if (!origin) return callback(null, true);
        const isLocal = origin.includes('localhost') || origin.includes('127.0.0.1');
        const isAllowed = allowedOrigins.includes(origin) || /vercel\.app$/.test(origin) || isLocal;
        if (isAllowed) return callback(null, true);
        if (allowedOrigins.length === 0) {
            // Demo mode: allow localhost/vercel only, reject others
            if (isLocal || /vercel\.app$/.test(origin)) return callback(null, true);
            return callback(new Error('Not allowed by CORS'));
        }
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));

// Body parser (limit size to prevent DoS)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Data sanitization against NoSQL injection & XSS
app.use(mongoSanitize());
app.use(xss());
app.use(hpp({ whitelist: ['sort','page','limit','category','keyword','select'] }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', limiter);
// Stricter limit for auth routes (brute-force protection)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: 'Too many auth attempts, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/auth', authLimiter);

// Database connection
const connectDB = async () => {
    let uri = process.env.MONGO_URI;
    
    // Vercel: if no MONGO_URI, use mock data (serverless memory DB is per-invocation, not persistent)
    if (process.env.VERCEL && (!uri || uri.includes('localhost') || uri === 'your_mongodb_connection_string')) {
        console.log('Vercel detected without MONGO_URI – using mock DB mode (no mongoose connection)');
        global.USE_MOCK_DB = true;
        return;
    }

    // Check if we should use in-memory DB (if no external URI or if it's the default local URI)
    const isLocalDefault = uri && (uri.includes('localhost') || uri.includes('127.0.0.1'));
    const isMissing = !uri || uri === 'your_mongodb_connection_string';

    if (isMissing || isLocalDefault) {
        try {
            console.log('Setting up automatic in-memory MongoDB for local development...');
            const { MongoMemoryServer } = require('mongodb-memory-server');
            const mongoServer = await MongoMemoryServer.create();
            uri = mongoServer.getUri();
            console.log('In-memory MongoDB successfully started!');
        } catch (err) {
            console.error('Failed to start in-memory DB. Using MONGO_URI from .env if available.');
        }
    }

    if (!uri) {
        console.warn('MONGO_URI not set and in-memory DB failed. Starting in mock mode without DB.');
        global.USE_MOCK_DB = true;
        return;
    }
    mongoose.connect(uri)
    .then(async () => {
        console.log(`MongoDB connected successfully to: ${uri.startsWith('mongodb+srv') ? 'Atlas Cluster' : 'Local/In-Memory DB'}`);
        // Automatic seeding for development
        const seedData = require('./utils/seeder');
        await seedData();
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        if (!process.env.VERCEL) process.exit(1);
        else {
            console.warn('Continuing without DB in Vercel – API will use mock data');
            global.USE_MOCK_DB = true;
        }
    });
};

connectDB();

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'success', message: 'API is running smoothly' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

const PORT = process.env.PORT || 5000;
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
}

module.exports = app;
