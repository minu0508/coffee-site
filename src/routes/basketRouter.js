var express = require('express');
var router = express.Router();
const basketController = require('../controller/basketController');

// ***** 메뉴 페이지 *****
router.get('/', basketController.basketPage);
router.post('/', basketController.basketOrder);
router.post('/deleteBasket/:menuID', basketController.deleteBasket);


module.exports = router;