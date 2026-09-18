const asyncHandler = require('express-async-handler');
const SupportTicket = require('../models/SupportTicket');

exports.createSupportTicket = asyncHandler(async (req, res) => {
    const { issueType, message } = req.body;

    if (!issueType || !message) {
        res.status(400);
        throw new Error('O tipo e a mensagem do problema são obrigatórios.');
    }

    const newTicket = new SupportTicket({
        issueType,
        message,
        user: req.user.id
    });

    const ticket = await newTicket.save();
    res.status(201).json(ticket);
});

// GET /api/support/my-tickets - tickets do usuário logado
exports.getMyTickets = asyncHandler(async (req, res) => {
    const tickets = await SupportTicket.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(tickets);
});