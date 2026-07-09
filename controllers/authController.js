const userModel = require("../models/user-model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const generateToken = require("../utils/generateToken");

module.exports.registerUser = async function (req, res) {
    try {
        const { email, password, fullname } = req.body;
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                message: "Email already exists"
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await userModel.create({
            email,
            password: hashedPassword,
            fullname
        });
        const token = generateToken(user);
        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        return res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                fullname: user.fullname,
                email: user.email
            }
        });
    } catch (err) {
        return res.status(500).json({
            message: "Something went wrong"
        });
    }
};

module.exports.loginUser = async function (req, res) {
    try {
        let { email, password } = req.body;
        let user = await userModel.findOne({ email });
        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }
        bcrypt.compare(password, user.password, function (err, result) {
            if (err) {
                return res.status(500).json({
                    message: "Something went wrong"
                });
            }
            if (result) {
                let token = generateToken(user);
                res.cookie("token", token, {
                    httpOnly: true,
                    sameSite: "lax",
                    maxAge: 7 * 24 * 60 * 60 * 1000
                });
                return res.status(200).json({
                    message: "Logged in successfully"
                });
            }
            return res.status(401).json({
                message: "Invalid email or password"
            });
        });
    } catch (err) {
        return res.status(500).json({
            message: "Something went wrong"
        });
    }
};