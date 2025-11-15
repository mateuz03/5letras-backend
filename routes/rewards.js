const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const rewardController = require('../controllers/rewardController');

router.get('/', rewardController.getAllRewards);
router.post('/redeem/:id', auth, rewardController.redeemReward);

module.exports = router;