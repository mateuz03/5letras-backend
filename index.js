const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// ----- Importa o módulo de erro e garante que vamos pegar a função certa -----
const errorHandlerModule = require('./middleware/errorHandler');

// Pega a função de erro, seja ela exportada direta, como { errorHandler } ou { default }
const errorHandler =
  typeof errorHandlerModule === 'function'
    ? errorHandlerModule
    : errorHandlerModule.errorHandler ||
      errorHandlerModule.default;

// Debug pra ver o que está vindo
console.log('👉 typeof errorHandlerModule =', typeof errorHandlerModule);
console.log('👉 valor de errorHandlerModule =', errorHandlerModule);
console.log('👉 typeof errorHandler =', typeof errorHandler);

// Se mesmo assim não for função, para tudo e mostra o problema
if (typeof errorHandler !== 'function') {
  console.error('❌ errorHandler NÃO é uma função! Verifique o export em middleware/errorHandler.js');
  process.exit(1);
}

// ----- Importando nossas rotas -----
const motelRoutes = require('./routes/motels');
const userRoutes = require('./routes/users');
const reservationRoutes = require('./routes/reservations');
const reviewRoutes = require('./routes/reviews');
const rewardRoutes = require('./routes/rewards');
const supportRoutes = require('./routes/support');

// ----- Conectando ao Banco de Dados -----
const mongoUri = process.env.MONGO_URI;

mongoose.connect(mongoUri)
  .then(() => {
    console.log('✅ Conectado ao MongoDB Atlas!');
  })
  .catch((err) => {
    console.error('❌ Erro ao conectar ao MongoDB:', err.message);
  });

// ----- Criando o App Express -----
const app = express();

app.use(cors());
app.use(express.json());

// Rota básica de teste
app.get('/', (req, res) => {
  res.send('API do 5Letras está no ar!');
});

// Rotas da API
app.use('/api/motels', motelRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/support', supportRoutes);

// ----- Middleware global de tratamento de erros -----
app.use(errorHandler);

// ----- Ligando o Servidor -----
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
