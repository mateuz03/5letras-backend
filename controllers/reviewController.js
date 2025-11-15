const asyncHandler = require('express-async-handler');
const Review = require('../models/Review');

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
    res.status(201).json(review);
});

exports.getMyReviews = asyncHandler(async (req, res) => {
    const reviews = await Review.find({ user: req.user.id })
        .populate('motel', 'name')
        .sort({ createdAt: -1 });
    res.json(reviews);
});