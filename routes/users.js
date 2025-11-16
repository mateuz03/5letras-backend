const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth'); // Importamos o "segurança"

// POST /api/users/register (rota pública)
router.post('/register', userController.registerUser);

// POST /api/users/login (rota pública)
router.post('/login', userController.loginUser);

// --- ROTA ADICIONADA ---
// GET /api/users/me (rota protegida)
// O 'auth' vai rodar primeiro, verificar o token, e nos dar o 'req.user'
router.get('/me', auth, userController.getUserProfile);

module.exports = router;