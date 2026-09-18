const Motel = require('../models/Motel');
const asyncHandler = require('express-async-handler');

// GET - Lista motéis com paginação e filtros:
//   ?page=1&limit=12          paginação
//   ?search=texto             busca no índice de texto (nome + localização)
//   ?location=Texto           localização parcial (case-insensitive)
//   ?category=Luxo            categoria exata
//   ?minPrice=100&maxPrice=250  faixa de preço das suítes
exports.getAllMotels = asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 12);
    const filter = {};

    if (req.query.search) {
        filter.$text = { $search: req.query.search };
    }
    if (req.query.location) {
        filter.location = { $regex: req.query.location, $options: 'i' };
    }
    if (req.query.category) {
        filter.categories = req.query.category;
    }

    const priceFilter = {};
    if (req.query.minPrice) priceFilter.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) priceFilter.$lte = Number(req.query.maxPrice);
    if (Object.keys(priceFilter).length > 0) {
        filter.suites = { $elemMatch: { price: priceFilter } };
    }

    const total = await Motel.countDocuments(filter);

    let query = Motel.find(filter);
    if (req.query.search) {
        query = query.sort({ score: { $meta: 'textScore' } });
    }
    const motels = await query
        .skip((page - 1) * limit)
        .limit(limit);

    res.json({
        motels,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    });
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