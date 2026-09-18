const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// --- MUDANÇA NA IMPORTAÇÃO ---
// Antes: const { errorHandler } = require('./middleware/errorHandler');
// Agora, importamos a função diretamente:
const errorHandler = require('./middleware/errorHandler');

// Importando nossas rotas
const motelRoutes = require('./routes/motels');
const userRoutes = require('./routes/users');
const reservationRoutes = require('./routes/reservations');
const reviewRoutes = require('./routes/reviews');
const rewardRoutes = require('./routes/rewards');
const supportRoutes = require('./routes/support');

// Rate limit para o login (proteção contra força bruta)
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => process.env.NODE_ENV === 'test',
    message: { success: false, message: 'Muitas tentativas. Tente novamente em 15 minutos.' }
});

// Criando o App Express
const app = express();

// CORS: se ALLOWED_ORIGINS estiver definido, restringe a esses domínios;
// caso contrário, permite qualquer origem (útil em desenvolvimento)
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
    : null;
app.use(cors(allowedOrigins ? { origin: allowedOrigins } : {}));

app.use(express.json());

// Definindo as Rotas da API
app.get('/', (req, res) => res.send('API do 5Letras está no ar!'));

// Health check para monitoramento do deploy
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        mongodb: mongoose.connection.readyState === 1 ? 'conectado' : 'desconectado'
    });
});

app.use('/api/motels', motelRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/support', supportRoutes);

// Rate limit aplicado somente ao login
app.use('/api/users/login', loginLimiter);

// Usando nosso "Manipulador de Erros"
app.use(errorHandler);

// Ligando o Servidor e conectando ao banco apenas quando executado diretamente
// (permite importar o app nos testes com banco de memória)
if (require.main === module) {
    // Conectando ao Banco de Dados
    const mongoUri = process.env.MONGO_URI;
    mongoose.connect(mongoUri)
        .then(() => {
            console.log('✅ Conectado ao MongoDB Atlas!');
        })
        .catch((err) => {
            console.error('❌ Erro ao conectar ao MongoDB:', err.message);
        });

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`🚀 Servidor rodando na porta ${PORT}`);
    });
}

module.exports = app;