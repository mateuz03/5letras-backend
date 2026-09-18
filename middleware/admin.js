// Middleware de administrador: use sempre DEPOIS do middleware auth
module.exports = function(req, res, next) {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    res.status(403).json({ message: 'Acesso restrito a administradores.' });
};
