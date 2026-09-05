require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api', limiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const connectDB = async () => {
    let uri = process.env.MONGO_URI;
    
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

    mongoose.connect(uri)
    .then(async () => {
        console.log(`MongoDB connected successfully to: ${uri.startsWith('mongodb+srv') ? 'Atlas Cluster' : 'Local/In-Memory DB'}`);
        // Automatic seeding for development
        const seedData = require('./utils/seeder');
        await seedData();
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
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
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
