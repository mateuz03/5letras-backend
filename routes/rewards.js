const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const rewardController = require('../controllers/rewardController');

router.get('/', rewardController.getAllRewards);
router.get('/my-redemptions', auth, rewardController.getMyRedemptions);
router.post('/', auth, admin, rewardController.createReward);
router.put('/:id', auth, admin, rewardController.updateReward);
router.post('/redeem/:id', auth, rewardController.redeemReward);

module.exports = router;