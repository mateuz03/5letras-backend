const asyncHandler = require('express-async-handler');
const Reservation = require('../models/Reservation');

exports.createReservation = asyncHandler(async (req, res) => {
    const { motel, suite, period, addons, total } = req.body;
    
    const newReservation = new Reservation({
        motel,
        suite,
        period,
        addons,
        total,
        user: req.user.id
    });

    const reservation = await newReservation.save();
    res.status(201).json(reservation);
});

exports.getMyReservations = asyncHandler(async (req, res) => {
    const reservations = await Reservation.find({ user: req.user.id }).sort({ bookingDate: -1 });
    res.json(reservations);
});