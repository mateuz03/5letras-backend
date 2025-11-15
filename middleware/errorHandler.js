// middleware/errorHandler.js

// Middleware de tratamento de erro (PRECISA ter 4 parâmetros)
function errorHandler(err, req, res, next) {
  console.error('🔥 Erro na API:', err);

  const status = err.status || 500;
  const message = err.message || 'Erro interno do servidor';

  res.status(status).json({
    success: false,
    message,
  });
}

// Exporta DIRETO a função
module.exports = errorHandler;
