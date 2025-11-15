const Motel = require('../models/Motel');
const asyncHandler = require('express-async-handler');

exports.getAllMotels = asyncHandler(async (req, res) => {
    const motels = await Motel.find();
    res.json(motels);
});

exports.getMotelById = asyncHandler(async (req, res) => {
    const motel = await Motel.findById(req.params.id);
    if (motel) {
        res.json(motel);
    } else {
        res.status(404);
        throw new Error('Motel não encontrado');
    }
});