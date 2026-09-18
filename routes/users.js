const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth'); // Importamos o "segurança"

// POST /api/users/register (rota pública)
router.post('/register', userController.registerUser);

// POST /api/users/login (rota pública)
router.post('/login', userController.loginUser);

// GET /api/users/me (rota protegida)
router.get('/me', auth, userController.getUserProfile);

// --- ROTA ADICIONADA ---
// PUT /api/users/me (rota protegida)
// Usamos a mesma rota '/me', mas com o método PUT
router.put('/me', auth, userController.updateUserProfile);

// GET /api/users/leaderboard (rota pública) - ranking de pontos
router.get('/leaderboard', userController.getLeaderboard);

module.exports = router;