const asyncHandler = require('express-async-handler');
const Reservation = require('../models/Reservation');
const User = require('../models/User');

// Pontos por estadia: 1 ponto a cada R$10 de total
function calcularPontos(total) {
    const totalNum = Number(total);
    if (!Number.isFinite(totalNum) || totalNum <= 0) return 0;
    return Math.floor(totalNum / 10);
}

exports.createReservation = asyncHandler(async (req, res) => {
    const { motel, suite, period, addons, total, checkIn } = req.body;

    let checkInDate;
    if (checkIn !== undefined) {
        checkInDate = new Date(checkIn);
        if (Number.isNaN(checkInDate.getTime())) {
            res.status(400);
            throw new Error('Data de check-in inválida.');
        }
    }

    const newReservation = new Reservation({
        motel,
        suite,
        period,
        addons,
        total,
        checkIn: checkInDate,
        user: req.user.id
    });

    const reservation = await newReservation.save();

    const pointsEarned = calcularPontos(total);
    if (pointsEarned > 0) {
        await User.findByIdAndUpdate(req.user.id, { $inc: { points: pointsEarned } });
    }

    res.status(201).json({ ...reservation.toObject(), pointsEarned });
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
