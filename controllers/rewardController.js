const asyncHandler = require('express-async-handler');
const Reward = require('../models/Reward');
const User = require('../models/User');

exports.getAllRewards = asyncHandler(async (req, res) => {
    const rewards = await Reward.find({ isActive: true }).sort({ points: 1 });
    res.json(rewards);
});

exports.redeemReward = asyncHandler(async (req, res) => {
    const reward = await Reward.findById(req.params.id);
    const user = await User.findById(req.user.id);

    if (!reward) {
        res.status(404);
        throw new Error('Recompensa não encontrada.');
    }
    if (user.points < reward.points) {
        res.status(400);
        throw new Error('Pontos insuficientes.');
    }

    user.points -= reward.points;
    await user.save();
    
    res.json({ message: 'Recompensa resgatada com sucesso!', newPoints: user.points });
});