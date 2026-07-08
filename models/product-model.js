const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    image: String,
    name: String,
    price: Number,
    discount: Number,
    bgcolor: String,
    panelcolor: String,
    textcolor: String,
});

module.exports = mongoose.model("product", productSchema);