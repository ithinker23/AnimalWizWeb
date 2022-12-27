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

router.route('/getMatches')
.post(controller.getMatches)

router.route('/updatePrices')
.post(controller.updatePrices)

module.exports = router; 