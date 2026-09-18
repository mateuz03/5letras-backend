const asyncHandler = require('express-async-handler');
const Reward = require('../models/Reward');
const User = require('../models/User');
const Redemption = require('../models/Redemption');

exports.getAllRewards = asyncHandler(async (req, res) => {
    const rewards = await Reward.find({ isActive: true }).sort({ points: 1 });
    res.json(rewards);
});

exports.getMyRedemptions = asyncHandler(async (req, res) => {
    const redemptions = await Redemption.find({ user: req.user.id })
        .populate('reward', 'title description points')
        .sort({ redeemedAt: -1 });
    res.json(redemptions);
});

exports.redeemReward = asyncHandler(async (req, res) => {
    const reward = await Reward.findById(req.params.id);

    if (!reward) {
        res.status(404);
        throw new Error('Recompensa não encontrada.');
    }

    const alreadyRedeemed = await Redemption.findOne({
        user: req.user.id,
        reward: reward._id
    });
    if (alreadyRedeemed) {
        res.status(400);
        throw new Error('Você já resgatou esta recompensa.');
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

    // Registra o resgate (o índice único user+reward impede repetições)
    await Redemption.create({
        user: req.user.id,
        reward: reward._id,
        pointsSpent: reward.points
    });

    res.json({ message: 'Recompensa resgatada com sucesso!', newPoints: updatedUser.points });
});
