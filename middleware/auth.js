const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    // Pega o token do cabeçalho da requisição
    const token = req.header('x-auth-token');

    // Se não houver token, retorna erro
    if (!token) {
        return res.status(401).json({ message: 'Acesso negado. Nenhum token fornecido.' });
    }

    // Se o token existir, verifica se ele é válido
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user; // Adiciona os dados do usuário na requisição
        next(); // Passa para a próxima etapa (a rota principal)
    } catch (err) {
        res.status(401).json({ message: 'Token inválido.' });
    }
};