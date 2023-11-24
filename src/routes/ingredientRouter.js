var express = require('express');
var router = express.Router();
const ingredientController = require('../controller/ingredientController');

// ***** 메뉴 페이지 *****
router.get('/', ingredientController.ingredientPage);
router.post('/addIngredient/:ingredientName', ingredientController.addIngredient);


module.exports = router;