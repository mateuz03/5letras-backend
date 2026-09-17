const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
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

// Criando o App Express
const app = express();
app.use(cors());
app.use(express.json());

// Definindo as Rotas da API
app.get('/', (req, res) => res.send('API do 5Letras está no ar!'));
app.use('/api/motels', motelRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/support', supportRoutes);

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