const request = require('supertest');
const app = require('../index');
const Motel = require('../models/Motel');
const { registerAndLogin } = require('./utils');

async function criarMotel() {
    return Motel.create({
        name: 'Motel Avaliado',
        location: 'Belo Horizonte, MG',
        image: 'http://imagem.com/foto.jpg',
        suites: []
    });
}

describe('POST /api/reviews', () => {
    test('retorna 401 sem token', async () => {
        const motel = await criarMotel();
        const res = await request(app)
            .post('/api/reviews')
            .send({ motelId: motel._id, rating: 5, comment: 'Ótimo' });

        expect(res.status).toBe(401);
    });

    test('cria avaliação', async () => {
        const token = await registerAndLogin('aval@test.com');
        const motel = await criarMotel();

        const res = await request(app)
            .post('/api/reviews')
            .set('x-auth-token', token)
            .send({ motelId: motel._id.toString(), rating: 4, comment: 'Muito bom' });

        expect(res.status).toBe(201);
        expect(res.body.rating).toBe(4);
    });

    test('retorna 400 quando faltam campos', async () => {
        const token = await registerAndLogin('aval2@test.com');

        const res = await request(app)
            .post('/api/reviews')
            .set('x-auth-token', token)
            .send({ rating: 4 });

        expect(res.status).toBe(400);
    });

    test('rejeita nota fora do intervalo 1-5', async () => {
        const token = await registerAndLogin('aval3@test.com');
        const motel = await criarMotel();

        const res = await request(app)
            .post('/api/reviews')
            .set('x-auth-token', token)
            .send({ motelId: motel._id.toString(), rating: 6, comment: 'X' });

        expect(res.status).toBe(500);
    });
});

describe('GET /api/reviews/my-reviews', () => {
    test('retorna as avaliações do usuário com o nome do motel', async () => {
        const token = await registerAndLogin('aval4@test.com');
        const motel = await criarMotel();

        await request(app)
            .post('/api/reviews')
            .set('x-auth-token', token)
            .send({ motelId: motel._id.toString(), rating: 5, comment: 'Excelente' });

        const res = await request(app)
            .get('/api/reviews/my-reviews')
            .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].motel.name).toBe('Motel Avaliado');
    });
});
