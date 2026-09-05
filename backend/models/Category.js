const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a category name'],
        trim: true,
        unique: true,
        maxLength: [50, 'Category name cannot exceed 50 characters']
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
        maxLength: [500, 'Description cannot exceed 500 characters']
    },
    image: {
        public_id: {
            type: String
        },
        url: {
            type: String
        }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Category', categorySchema);
