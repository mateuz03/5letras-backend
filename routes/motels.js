const express = require('express');
const router = express.Router();
const motelController = require('../controllers/motelController');

// Aponta a rota GET / para a função de buscar todos
router.get('/', motelController.getAllMotels);

// Aponta a rota GET /:id para a função de buscar por ID
router.get('/:id', motelController.getMotelById);

// --- ROTA ADICIONADA ---
// Aponta a rota POST / para a função de criar
router.post('/', motelController.createMotel);

module.exports = router;