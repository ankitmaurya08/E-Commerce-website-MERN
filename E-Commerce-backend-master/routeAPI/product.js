const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    productId: {
        type: String,
        required: true,
        unique: true
    },
    category: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    size: {
        type: String,
        // required: true
    },
    rating: {
        type: Number,
        required: true
    },
    producturl: {
        type: String,
        required: true
    },
    productDescription: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Product', productSchema);