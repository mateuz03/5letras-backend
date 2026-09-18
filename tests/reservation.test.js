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

describe('GET /api/reservations/:id', () => {
    test('retorna 404 para reserva inexistente', async () => {
        const token = await registerAndLogin('detalhe@test.com');

        const res = await request(app)
            .get('/api/reservations/000000000000000000000000')
            .set('x-auth-token', token);

        expect(res.status).toBe(404);
    });

    test('o dono vê a reserva com dados do motel', async () => {
        const token = await registerAndLogin('dono@test.com');
        const motel = await criarMotel();

        const created = await request(app)
            .post('/api/reservations')
            .set('x-auth-token', token)
            .send({ ...corpoBase, motel: motel._id });

        const res = await request(app)
            .get(`/api/reservations/${created.body._id}`)
            .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body.motel.name).toBe('Motel Reserva');
    });

    test('retorna 403 para outro usuário', async () => {
        const motel = await criarMotel();
        const tokenDono = await registerAndLogin('donodeteste@test.com');
        const tokenOutro = await registerAndLogin('outro@test.com');

        const created = await request(app)
            .post('/api/reservations')
            .set('x-auth-token', tokenDono)
            .send({ ...corpoBase, motel: motel._id });

        const res = await request(app)
            .get(`/api/reservations/${created.body._id}`)
            .set('x-auth-token', tokenOutro);

        expect(res.status).toBe(403);
    });
});

describe('PATCH /api/reservations/:id/cancel', () => {
    test('cancela uma reserva confirmada', async () => {
        const token = await registerAndLogin('cancela@test.com');
        const motel = await criarMotel();

        const created = await request(app)
            .post('/api/reservations')
            .set('x-auth-token', token)
            .send({ ...corpoBase, motel: motel._id });

        const res = await request(app)
            .patch(`/api/reservations/${created.body._id}/cancel`)
            .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body.status).toBe('Cancelada');
    });

    test('retorna 400 ao cancelar reserva já cancelada', async () => {
        const token = await registerAndLogin('cancela2@test.com');
        const motel = await criarMotel();

        const created = await request(app)
            .post('/api/reservations')
            .set('x-auth-token', token)
            .send({ ...corpoBase, motel: motel._id });

        await request(app)
            .patch(`/api/reservations/${created.body._id}/cancel`)
            .set('x-auth-token', token);

        const res = await request(app)
            .patch(`/api/reservations/${created.body._id}/cancel`)
            .set('x-auth-token', token);

        expect(res.status).toBe(400);
    });
});
