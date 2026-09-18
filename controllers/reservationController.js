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

exports.getReservationById = asyncHandler(async (req, res) => {
    const reservation = await Reservation.findById(req.params.id)
        .populate('motel', 'name location image');

    if (!reservation) {
        res.status(404);
        throw new Error('Reserva não encontrada.');
    }

    // Só o dono da reserva pode vê-la
    if (reservation.user.toString() !== req.user.id) {
        res.status(403);
        throw new Error('Você não tem permissão para ver esta reserva.');
    }

    res.json(reservation);
});

exports.cancelReservation = asyncHandler(async (req, res) => {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
        res.status(404);
        throw new Error('Reserva não encontrada.');
    }

    // Só o dono da reserva pode cancelá-la
    if (reservation.user.toString() !== req.user.id) {
        res.status(403);
        throw new Error('Você não tem permissão para cancelar esta reserva.');
    }

    if (reservation.status !== 'Confirmada') {
        res.status(400);
        throw new Error('Apenas reservas confirmadas podem ser canceladas.');
    }

    reservation.status = 'Cancelada';
    await reservation.save();
    res.json(reservation);
});
