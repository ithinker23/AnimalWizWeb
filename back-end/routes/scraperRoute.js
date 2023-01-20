const express = require('express');
const router = express.Router();

const controller = require('../controllers/scraperController');

// route the request to UrlController
router.route('/startScraper')
.post(controller.startScraper);

module.exports = router