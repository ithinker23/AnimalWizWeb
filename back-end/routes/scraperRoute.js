const express = require('express');
const router = express.Router();

const controller = require('../controllers/scraperController');

// route the request to itemsController
router.route('/start')
.get(controller.startScrapers);

module.exports = router; 