const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const Motel = require('../models/Motel');

const motelValido = {
    name: 'Motel Teste',
    location: 'São Paulo, SP',
    image: 'http://imagem.com/foto.jpg',
    suites: []
};

describe('Rotas de motéis', () => {
    test('POST /api/motels cria um motel', async () => {
        const res = await request(app).post('/api/motels').send(motelValido);

        expect(res.status).toBe(201);
        expect(res.body.name).toBe('Motel Teste');
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
