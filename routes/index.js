const express = require("express");
const router = express.Router();
const isLoggedin = require("../middlewares/isLoggedin")
const productModel = require("../models/product-model");
const userModel = require("../models/user-model");

router.get("/", function(req, res){
    res.send("API is working")
});

router.get("/shop", isLoggedin, async function (req, res) {
    let products = await productModel.find().select("-image");

    return res.status(200).json({
        message: "Shop successfully opened",
        user: req.user,
        products: products
    });
});

router.get("/addtocart/:productid", isLoggedin, async function (req, res) {
    try {
        const user = await userModel.findOne({
            email: req.user.email
        });
        const product = await productModel.findById(req.params.productid);
        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }
        const existingItem = user.cart.find(
            item => item.product.toString() === req.params.productid
        );
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            user.cart.push({
                product: product._id,
                quantity: 1
            });
        }

        await user.save();
        return res.status(200).json({
            message: "Added to cart",
            cart: user.cart
        });
    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
});

router.get("/cart", isLoggedin, async function (req, res) {
    try {
        const user = await userModel
            .findOne({ email: req.user.email })
            .populate("cart.product");

        let subtotal = 0;
        let totalDiscount = 0;
        user.cart.forEach((item) => {
            subtotal += item.product.price * item.quantity;
            totalDiscount += item.product.discount * item.quantity;
        });
        const platformFee = 20;
        const finalBill = subtotal - totalDiscount + platformFee;
        return res.status(200).json({
            message: "Cart fetched successfully",
            cart: user.cart,
            bill: {
                subtotal,
                totalDiscount,
                platformFee,
                finalBill
            }
        });
    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
});

module.exports = router;