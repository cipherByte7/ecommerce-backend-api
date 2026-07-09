const jwt = require("jsonwebtoken");
const ownerModel = require("../models/owners-model");

module.exports = async function (req, res, next) {
    try {
        const token = req.cookies.ownerToken;

        if (!token) {
            return res.status(401).json({
                message: "Owner login required"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_KEY);

        const owner = await ownerModel
            .findById(decoded.id)
            .select("-password");

        if (!owner || decoded.role !== "owner") {
            return res.status(403).json({
                message: "Owner access required"
            });
        }

        req.owner = owner;
        next();

    } catch (err) {
        return res.status(401).json({
            message: "Invalid or expired owner token"
        });
    }
};