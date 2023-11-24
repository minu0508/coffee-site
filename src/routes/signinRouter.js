var express = require("express");
var router = express.Router();

const userController = require("../controller/userController");

//로그인
router.get("/", userController.signinPage);
router.post("/", userController.signin);

module.exports = router;