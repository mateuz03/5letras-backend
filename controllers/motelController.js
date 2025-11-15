const Motel = require('../models/Motel');
const asyncHandler = require('express-async-handler');

// GET - Busca todos os motéis (Já existia)
exports.getAllMotels = asyncHandler(async (req, res) => {
    const motels = await Motel.find();
    res.json(motels);
});

// GET - Busca um motel por ID (Já existia)
exports.getMotelById = asyncHandler(async (req, res) => {
    const motel = await Motel.findById(req.params.id);
    if (motel) {
        res.json(motel);
    } else {
        res.status(404);
        throw new Error('Motel não encontrado');
    }
});

// --- FUNÇÃO ADICIONADA ---
// POST - Cria um novo motel
exports.createMotel = asyncHandler(async (req, res) => {
    // Pega os dados do corpo da requisição (do Insomnia)
    const { name, location, rating, price, image, distance, description, images, suites, categories } = req.body;

    // Cria um novo documento de motel
    const motel = new Motel({
        name, location, rating, price, image, distance, description, images, suites, categories
    });

    // Salva o novo motel no banco de dados
    const createdMotel = await motel.save();
    res.status(201).json(createdMotel); // Responde com o motel criado
});