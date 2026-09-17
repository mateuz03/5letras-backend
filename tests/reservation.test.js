const request = require('supertest');
const app = require('../index');
const Motel = require('../models/Motel');
const { registerAndLogin } = require('./utils');

async function criarMotel() {
    return Motel.create({
        name: 'Motel Reserva',
        location: 'Rio de Janeiro, RJ',
        image: 'http://imagem.com/foto.jpg',
        suites: []
    });
}

const corpoBase = {
    suite: { suiteId: 'suite-1', name: 'Suíte Luxo' },
    period: { label: '4 horas', price: 150 },
    addons: [{ name: 'Espumante', price: 50 }],
    total: 200
};

describe('POST /api/reservations', () => {
    test('retorna 401 sem token', async () => {
        const motel = await criarMotel();
        const res = await request(app)
            .post('/api/reservations')
            .send({ ...corpoBase, motel: motel._id });

        expect(res.status).toBe(401);
    });

    test('cria reserva vinculada ao usuário logado', async () => {
        const token = await registerAndLogin('reso@test.com');
        const motel = await criarMotel();

        const res = await request(app)
            .post('/api/reservations')
            .set('x-auth-token', token)
            .send({ ...corpoBase, motel: motel._id });

        expect(res.status).toBe(201);
        expect(res.body.total).toBe(200);
        expect(res.body.status).toBe('Confirmada');
    });
});

describe('GET /api/reservations/my-reservations', () => {
    test('retorna apenas as reservas do usuário logado', async () => {
        const motel = await criarMotel();
        const token1 = await registerAndLogin('user1@test.com');
        const token2 = await registerAndLogin('user2@test.com');

        await request(app)
            .post('/api/reservations')
            .set('x-auth-token', token1)
            .send({ ...corpoBase, motel: motel._id });

        const res = await request(app)
            .get('/api/reservations/my-reservations')
            .set('x-auth-token', token1);

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);

        const res2 = await request(app)
            .get('/api/reservations/my-reservations')
            .set('x-auth-token', token2);
        expect(res2.body).toHaveLength(0);
    });
});
