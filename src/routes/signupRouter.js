var express = require("express");
var router = express.Router();

const userController = require("../controller/userController");

// //회원가입
router.get("/", userController.signupPage);
router.post("/", userController.signup);

module.exports = router;