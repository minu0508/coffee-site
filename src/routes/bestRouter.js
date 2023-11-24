var express = require('express');
var router = express.Router();
var bestController = require('../controller/bestController');

router.get('/', bestController.bestPage);
router.post('/printgrade', bestController.print);

module.exports = router;
