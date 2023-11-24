var express = require("express");
var router = express.Router();

const reportController = require("../controller/supplyReport");

// //회원가입
router.get("/", reportController.reportPage);

module.exports = router;