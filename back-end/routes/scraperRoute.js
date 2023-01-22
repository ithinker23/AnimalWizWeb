const express = require('express');
const router = express.Router();

const controller = require('../controllers/scraperController');

// route the request to UrlController
router.route('/scrape')
.post(controller.scrape);

module.exports = router