const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const Motel = require('../models/Motel');
const { registerAndLogin } = require('./utils');

const motelValido = {
    name: 'Motel Teste',
    location: 'São Paulo, SP',
    image: 'http://imagem.com/foto.jpg',
    suites: []
};

describe('Rotas de motéis', () => {
    test('POST /api/motels retorna 401 sem token', async () => {
        const res = await request(app).post('/api/motels').send(motelValido);

        expect(res.status).toBe(401);
    });

    test('POST /api/motels cria um motel com token', async () => {
        const token = await registerAndLogin('admin@test.com');

        const res = await request(app)
            .post('/api/motels')
            .set('x-auth-token', token)
            .send({
                ...motelValido,
                price: 'A partir de R$ 120',
                categories: ['Luxo', 'Temático']
            });

        expect(res.status).toBe(201);
        expect(res.body.name).toBe('Motel Teste');
        expect(res.body.price).toBe('A partir de R$ 120');
        expect(res.body.categories).toEqual(['Luxo', 'Temático']);
    });

    test('POST /api/motels aceita suíte com preço numérico', async () => {
        const token = await registerAndLogin('admin2@test.com');

        const res = await request(app)
            .post('/api/motels')
            .set('x-auth-token', token)
            .send({
                ...motelValido,
                suites: [{
                    name: 'Suíte Luxo',
                    price: 150,
                    image: 'http://imagem.com/suite.jpg',
                    amenities: ['Hidro', 'Sauna']
                }]
            });

        expect(res.status).toBe(201);
        expect(res.body.suites[0].price).toBe(150);
    });

    test('GET /api/motels lista os motéis', async () => {
        await Motel.create(motelValido);

        const res = await request(app).get('/api/motels');

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].name).toBe('Motel Teste');
    });

    test('GET /api/motels/:id retorna o motel', async () => {
        const motel = await Motel.create(motelValido);

        const res = await request(app).get(`/api/motels/${motel._id}`);

        expect(res.status).toBe(200);
        expect(res.body._id).toBe(motel._id.toString());
    });

    test('GET /api/motels/:id retorna 404 para motel inexistente', async () => {
        const res = await request(app)
            .get(`/api/motels/${new mongoose.Types.ObjectId()}`);

        expect(res.status).toBe(404);
    });
});
