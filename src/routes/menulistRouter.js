var express = require('express');
var router = express.Router();
const menuController = require('../controller/menuController');

// ***** 메뉴 페이지 *****
router.get('/', menuController.menuPage);
router.post('/search', menuController.searchMenu);
router.get('/detail/:menuID', menuController.menuDetail);
router.post('/addbasket/:menuID', menuController.addBasket);
router.post('/directorder/:menuID', menuController.directorder);
router.post('/representative/:menuID', menuController.representativeMenu);
router.post('/Recommended/:menuID', menuController.RecommendedMenu);


module.exports = router;