const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    fullname: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    cart: [
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "product",
            required: true
        },
        quantity: {
            type: Number,
            default: 1,
            min: 1
        }
    }
    ],
    
    orders:{
        type:Array,
        default: [],
    },
    contact: Number,
    picture: String,

});

module.exports = mongoose.model("user", userSchema);