const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const supportController = require('../controllers/supportController');

router.post('/tickets', auth, supportController.createSupportTicket);

module.exports = router;