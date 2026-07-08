const express = require('express');
const router = express.Router();
const ownerModel = require("../models/owners-model")

if(process.env.NODE_ENV === "development"){
    router.post("/create", async function(req, res){    
    });
}

router.get("/admin", function(req, res){
    res.send("Create New Product page opened here");
});

module.exports = router;