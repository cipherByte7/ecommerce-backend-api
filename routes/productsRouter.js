const express = require("express");
const router = express.Router();
const upload = require("../config/multer-config");
const productModel = require("../models/product-model");
const isOwner = require("../middlewares/isOwner");
const isowner = require("../middlewares/isOwner");

router.post(
    "/create",
    isowner,
    upload.single("image"),
    async function (req, res) {
        try {
        let {
            name,
            price,
            discount,
            bgcolor,
            panelcolor,
            textcolor
        } = req.body;

        if (!req.file) {
            return res.status(400).json({
                message: "Product image is required"
            });
        }

        let product = await productModel.create({
            image: req.file.buffer,
            name,
            price,
            discount,
            bgcolor,
            panelcolor,
            textcolor
        });

        return res.status(201).json({
            message: "Product created successfully",
            product: product
        });

    } catch (err) {
        return res.status(500).send(err.message);
    }
    }
);

    


module.exports = router;