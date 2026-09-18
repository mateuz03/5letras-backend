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

    test('GET /api/motels lista os motéis com paginação', async () => {
        await Motel.create(motelValido);

        const res = await request(app).get('/api/motels');

        expect(res.status).toBe(200);
        expect(res.body.motels).toHaveLength(1);
        expect(res.body.motels[0].name).toBe('Motel Teste');
        expect(res.body.pagination).toEqual({
            page: 1, limit: 12, total: 1, pages: 1
        });
    });

    test('GET /api/motels respeita page e limit', async () => {
        await Motel.create([
            { ...motelValido, name: 'Motel A' },
            { ...motelValido, name: 'Motel B' },
            { ...motelValido, name: 'Motel C' }
        ]);

        const res = await request(app).get('/api/motels?page=2&limit=2');

        expect(res.status).toBe(200);
        expect(res.body.motels).toHaveLength(1);
        expect(res.body.pagination.total).toBe(3);
        expect(res.body.pagination.pages).toBe(2);
        expect(res.body.pagination.page).toBe(2);
    });

    test('GET /api/motels filtra por location parcial', async () => {
        await Motel.create([
            { ...motelValido, name: 'Motel SP', location: 'São Paulo, SP' },
            { ...motelValido, name: 'Motel RJ', location: 'Rio de Janeiro, RJ' }
        ]);

        const res = await request(app).get('/api/motels?location=rio');

        expect(res.status).toBe(200);
        expect(res.body.motels).toHaveLength(1);
        expect(res.body.motels[0].name).toBe('Motel RJ');
    });

    test('GET /api/motels filtra por category', async () => {
        await Motel.create([
            { ...motelValido, name: 'Motel Luxo', categories: ['Luxo'] },
            { ...motelValido, name: 'Motel Simples', categories: ['Econômico'] }
        ]);

        const res = await request(app).get('/api/motels?category=Luxo');

        expect(res.status).toBe(200);
        expect(res.body.motels).toHaveLength(1);
        expect(res.body.motels[0].name).toBe('Motel Luxo');
    });

    test('GET /api/motels filtra por faixa de preço das suítes', async () => {
        await Motel.create([
            {
                ...motelValido,
                name: 'Motel Barato',
                suites: [{ name: 'S1', price: 80, image: 'i.jpg' }]
            },
            {
                ...motelValido,
                name: 'Motel Caro',
                suites: [{ name: 'S1', price: 300, image: 'i.jpg' }]
            }
        ]);

        const res = await request(app).get('/api/motels?minPrice=100&maxPrice=500');

        expect(res.status).toBe(200);
        expect(res.body.motels).toHaveLength(1);
        expect(res.body.motels[0].name).toBe('Motel Caro');
    });

    test('GET /api/motels busca por texto (índice name+location)', async () => {
        await Motel.init(); // garante que o índice de texto foi criado
        await Motel.create([
            { ...motelValido, name: 'Pousada Encanto', location: 'São Paulo, SP' },
            { ...motelValido, name: 'Motel Estrela', location: 'Campinas, SP' }
        ]);

        const res = await request(app).get('/api/motels?search=encanto');

        expect(res.status).toBe(200);
        expect(res.body.motels).toHaveLength(1);
        expect(res.body.motels[0].name).toBe('Pousada Encanto');
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
