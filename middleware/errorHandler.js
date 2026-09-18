// Middleware de tratamento de erro (PRECISA ter 4 parâmetros)
function errorHandler(err, req, res, next) {
  console.error('🔥 Erro na API:', err.message);

  // Prioridade: err.statusCode explícito > statusCode já definido na resposta > 500
  const status = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);

  // Só expõe a mensagem original para erros do cliente (4xx);
  // erros internos (5xx) não vazam detalhes para o cliente
  const message = status < 500
    ? (err.message || 'Erro na requisição')
    : 'Erro interno do servidor';

  res.status(status).json({
    success: false,
    message,
  });
}

// Exporta DIRETO a função
module.exports = errorHandler;