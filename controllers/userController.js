const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Lógica de Cadastro (sem alteração)
exports.registerUser = asyncHandler(async (req, res) => {
    // ... (código existente)
});

// Lógica de Login (sem alteração)
exports.loginUser = asyncHandler(async (req, res) => {
    // ... (código existente)
});

// Busca os dados do usuário logado (sem alteração)
exports.getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).select('-password');
    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            points: user.points
        });
    } else {
        res.status(404);
        throw new Error('Usuário não encontrado.');
    }
});

// --- FUNÇÃO ADICIONADA ---
// PUT /api/users/me
// Atualiza os dados do usuário logado
exports.updateUserProfile = asyncHandler(async (req, res) => {
    // Encontra o usuário pelo ID que está no token
    const user = await User.findById(req.user.id);

    if (user) {
        // Atualiza os campos se eles foram enviados na requisição
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;

        // Verifica se o usuário está tentando atualizar a senha
        if (req.body.password) {
            user.password = req.body.password;
        }

        // Salva o usuário atualizado. O Mongoose vai re-criptografar a senha se ela foi mudada.
        const updatedUser = await user.save();

        // Retorna os novos dados (sem a senha)
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            points: updatedUser.points,
        });
    } else {
        res.status(404);
        throw new Error('Usuário não encontrado.');
    }
});