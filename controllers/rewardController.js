const asyncHandler = require('express-async-handler');
const Reward = require('../models/Reward');
const User = require('../models/User');

exports.getAllRewards = asyncHandler(async (req, res) => {
    const rewards = await Reward.find({ isActive: true }).sort({ points: 1 });
    res.json(rewards);
});

exports.redeemReward = asyncHandler(async (req, res) => {
    const reward = await Reward.findById(req.params.id);

    if (!reward) {
        res.status(404);
        throw new Error('Recompensa não encontrada.');
    }

    const user = await User.findById(req.user.id);
    if (!user) {
        res.status(404);
        throw new Error('Usuário não encontrado.');
    }
    if (user.points < reward.points) {
        res.status(400);
        throw new Error('Pontos insuficientes.');
    }

    // Atualização atômica: só deduz os pontos se o usuário ainda tiver saldo suficiente
    const updatedUser = await User.findOneAndUpdate(
        { _id: req.user.id, points: { $gte: reward.points } },
        { $inc: { points: -reward.points } },
        { new: true }
    );

    if (!updatedUser) {
        res.status(400);
        throw new Error('Pontos insuficientes.');
    }

    res.json({ message: 'Recompensa resgatada com sucesso!', newPoints: updatedUser.points });
});