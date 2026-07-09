const express = require("express");
const router = express.Router();

const {
    registerUser,
    loginUser
} = require("../controllers/authController");

router.get("/", function (req, res) {
    res.send("hey it's working");
});

router.post("/logout", function (req, res) {
    res.clearCookie("token");

    return res.status(200).json({
        message: "Logged out successfully"
    });
});

router.post("/register", registerUser);
router.post("/login", loginUser);

module.exports = router;