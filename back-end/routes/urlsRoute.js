const express = require('express');
const router = express.Router();

const controller = require('../controllers/urlsController');

// route the request to UrlController
router.route('/getSearchUrl')
.post(controller.getSearchUrl);

module.exports = router