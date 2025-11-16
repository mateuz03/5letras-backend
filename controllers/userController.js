const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Lógica de Cadastro (sem alteração)
exports.registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Por favor, preencha todos os campos.');
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('Utilizador com este e-mail já existe.');
    }
    const user = await User.create({ name, email, password });
    res.status(201).json({ message: 'Utilizador criado com sucesso!', id: user.id });
});

// Lógica de Login (sem alteração)
exports.loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
        const payload = { user: { id: user.id } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' });
        res.json({ token });
    } else {
        res.status(401);
        throw new Error('Credenciais inválidas.');
    }
});

// --- FUNÇÃO ADICIONADA ---
// GET /api/users/me
// Busca os dados do utilizador logado (protegido)
exports.getUserProfile = asyncHandler(async (req, res) => {
    // Nós temos o 'req.user.id' graças ao nosso middleware 'auth'
    // .select('-password') remove a palavra-passe da resposta, por segurança
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
        throw new Error('Utilizador não encontrado.');
    }
});