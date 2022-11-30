const express = require('express');
const router = express.Router();

const controller = require('../controllers/itemsController');

// route the request to itemsController
router.route('/getItems')
.post(controller.getItems);

router.route('/updateMatches')
.post(controller.updateMatches)

router.route('/getPidList')
.post(controller.getPidList)

module.exports = router; 