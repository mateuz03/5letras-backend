const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Review = require('../models/Review');
const Motel = require('../models/Motel');

// Recalcula a média das avaliações e atualiza o rating do motel
async function updateMotelRating(motelId) {
    const stats = await Review.aggregate([
        { $match: { motel: new mongoose.Types.ObjectId(motelId) } },
        { $group: { _id: '$motel', avgRating: { $avg: '$rating' } } }
    ]);

    const rating = stats.length > 0 ? Math.round(stats[0].avgRating * 10) / 10 : 0;
    await Motel.findByIdAndUpdate(motelId, { rating });
}

exports.createReview = asyncHandler(async (req, res) => {
    const { motelId, rating, comment } = req.body;

    if (!motelId || !rating || !comment) {
        res.status(400);
        throw new Error('Todos os campos são obrigatórios.');
    }
    const newReview = new Review({
        motel: motelId,
        rating,
        comment,
        user: req.user.id
    });
    const review = await newReview.save();

    // Mantém o rating do motel sempre em sincronia com as avaliações
    await updateMotelRating(motelId);

    res.status(201).json(review);
});

exports.getMyReviews = asyncHandler(async (req, res) => {
    const reviews = await Review.find({ user: req.user.id })
        .populate('motel', 'name')
        .sort({ createdAt: -1 });
    res.json(reviews);
});
