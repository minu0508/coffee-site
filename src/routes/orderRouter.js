var express = require('express');
var router = express.Router();
const orderController = require('../controller/orderController');

router.get('/', orderController.orderPage);
router.post('/', orderController.ordering);
router.post('/direct', orderController.direct);


// 주문, 주문내역, 상세조회,

module.exports = router;
