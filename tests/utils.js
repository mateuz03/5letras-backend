const request = require('supertest');
const app = require('../index');

// Registra um usuário e faz login, retornando o token JWT
async function registerAndLogin(email = 'user@test.com', password = 'senha123', name = 'Usuário Teste') {
    await request(app).post('/api/users/register').send({ name, email, password });
    const res = await request(app).post('/api/users/login').send({ email, password });
    return res.body.token;
}

module.exports = { registerAndLogin };
