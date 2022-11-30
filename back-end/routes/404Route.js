const express = require('express');
const router = express.Router();

const controller = require('../controllers/404Controller');

// route the request to itemsController
router.route('/*')
.get(controller.send404);

module.exports = router; 