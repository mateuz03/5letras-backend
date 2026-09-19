const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Lógica de Cadastro
exports.registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Por favor, preencha todos os campos.');
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('Usuário com este e-mail já existe.');
    }
    const user = await User.create({ name, email, password });
    res.status(201).json({ message: 'Usuário criado com sucesso!', id: user.id });
});

// Lógica de Login
exports.loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
        const payload = { user: { id: user.id, role: user.role } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token });
    } else {
        res.status(401);
        throw new Error('Credenciais inválidas.');
    }
});

// GET /api/users/favorites - lista os motéis favoritos do usuário logado
exports.getFavorites = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).populate('favorites');
    if (!user) {
        res.status(404);
        throw new Error('Usuário não encontrado.');
    }
    res.json(user.favorites);
});

// POST /api/users/favorites/:motelId - favorita ou remove o motel (toggle)
exports.toggleFavorite = asyncHandler(async (req, res) => {
    const { motelId } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) {
        res.status(404);
        throw new Error('Usuário não encontrado.');
    }

    const index = user.favorites.findIndex((f) => f.toString() === motelId);
    if (index >= 0) {
        user.favorites.splice(index, 1);
    } else {
        user.favorites.push(motelId);
    }
    await user.save();

    res.json({ favorited: index < 0, favorites: user.favorites });
});

// Ranking dos usuários com mais pontos
exports.getLeaderboard = asyncHandler(async (req, res) => {
    const users = await User.find()
        .select('name points')
        .sort({ points: -1 })
        .limit(10);
    res.json(users);
});

// Busca os dados do usuário logado (sem alteração)
exports.getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).select('-password');
    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            points: user.points,
            role: user.role,
            favorites: user.favorites
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
        // Verifica duplicidade de e-mail antes de atualizar
        if (req.body.email && req.body.email !== user.email) {
            const emailExists = await User.findOne({ email: req.body.email });
            if (emailExists) {
                res.status(400);
                throw new Error('Este e-mail já está em uso.');
            }
        }

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
            role: updatedUser.role,
        });
    } else {
        res.status(404);
        throw new Error('Usuário não encontrado.');
    }
});