const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const supportController = require('../controllers/supportController');

router.post('/tickets', auth, supportController.createSupportTicket);
router.get('/my-tickets', auth, supportController.getMyTickets);

module.exports = router;