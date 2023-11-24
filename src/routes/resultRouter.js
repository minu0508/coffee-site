var express = require('express');
var router = express.Router();
const resultController = require('../controller/resultController');

router.get('/', resultController.resultPage);
router.post('/', resultController.resultEnd);

module.exports = router;