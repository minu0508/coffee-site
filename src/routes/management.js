var express = require('express');
var router = express.Router();
const managementController = require('../controller/managementController');

// ***** 메뉴 페이지 *****
router.get('/', managementController.managementPage);
router.get('/detail/:orderID', managementController.orderDetail);
router.post('/cancel/:order_orderID/:menu_menuID', managementController.orderCancel);


module.exports = router;