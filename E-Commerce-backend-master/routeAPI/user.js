const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    productId: {
        type: String,
        default: ''
    },
    size: {
        type: String,
        require: true
    },
    quantity: {
        type: Number,
        default: 1
    },
});

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    phone: {
        type: Number,
        required: true,
    },
    cart: [{
        type: productSchema,
    }],
});


module.exports = mongoose.model('User', userSchema);
