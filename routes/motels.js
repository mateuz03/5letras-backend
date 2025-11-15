const express = require('express');
const router = express.Router();
const motelController = require('../controllers/motelController');

router.get('/', motelController.getAllMotels);
router.get('/:id', motelController.getMotelById);

module.exports = router;