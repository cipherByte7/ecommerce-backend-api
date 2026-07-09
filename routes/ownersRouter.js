const express = require('express');
const router = express.Router();
const ownerModel = require("../models/owners-model")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

    router.post("/create", async function (req, res) {
    try {
        const { fullname, email, password, gstin } = req.body;
        const existingOwner = await ownerModel.findOne({ email });
        if (existingOwner) {
            return res.status(409).json({
                message: "Owner already exists"
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const owner = await ownerModel.create({
            fullname,
            email,
            password: hashedPassword,
            gstin
        });
        return res.status(201).json({
            message: "Owner created successfully",
            owner: {
                id: owner._id,
                fullname: owner.fullname,
                email: owner.email,
                gstin: owner.gstin
            }
        });
    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
});


router.get("/admin", function (req, res) {
    res.send("Create New Product page would open here");
});

router.post("/login", async function (req, res) {
    try {
        const { email, password } = req.body;
        const owner = await ownerModel.findOne({ email });
        if (!owner) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }
        const isPasswordCorrect = await bcrypt.compare(
            password,
            owner.password
        );
        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }
        const ownerToken = jwt.sign(
    {
        id: owner._id,
        email: owner.email,
        role: "owner"
    },
    process.env.JWT_KEY,
    {
        expiresIn: "7d"
    }
);

    res.cookie("ownerToken", ownerToken, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000
    }); 

    return res.status(200).json({
        message: "Owner logged in successfully"
    });

    } catch (err) {
        return res.status(500).json({
            message: "Something went wrong"
        });
    }
});

router.post("/logout", function (req, res) {
    res.clearCookie("token");

    return res.status(200).json({
        message: "Logged out successfully"
    });
});

module.exports = router; 