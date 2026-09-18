const request = require('supertest');
const app = require('../index');
const { registerAndLogin } = require('./utils');

describe('POST /api/support/tickets', () => {
    test('retorna 401 sem token', async () => {
        const res = await request(app)
            .post('/api/support/tickets')
            .send({ issueType: 'bug', message: 'Erro na tela' });

        expect(res.status).toBe(401);
    });

    test('cria um ticket de suporte', async () => {
        const token = await registerAndLogin('suporte@test.com');

        const res = await request(app)
            .post('/api/support/tickets')
            .set('x-auth-token', token)
            .send({ issueType: 'bug', message: 'Erro na tela de login' });

        expect(res.status).toBe(201);
        expect(res.body.status).toBe('Aberto');
        expect(res.body.issueType).toBe('bug');
    });

    test('retorna 400 quando faltam campos', async () => {
        const token = await registerAndLogin('suporte2@test.com');

        const res = await request(app)
            .post('/api/support/tickets')
            .set('x-auth-token', token)
            .send({ issueType: 'bug' });

        expect(res.status).toBe(400);
    });
});

describe('GET /api/support/my-tickets', () => {
    test('retorna apenas os tickets do usuário logado', async () => {
        const token1 = await registerAndLogin('ticket1@test.com');
        const token2 = await registerAndLogin('ticket2@test.com');

        await request(app)
            .post('/api/support/tickets')
            .set('x-auth-token', token1)
            .send({ issueType: 'bug', message: 'Problema A' });

        await request(app)
            .post('/api/support/tickets')
            .set('x-auth-token', token2)
            .send({ issueType: 'suggestion', message: 'Problema B' });

        const res = await request(app)
            .get('/api/support/my-tickets')
            .set('x-auth-token', token1);

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].message).toBe('Problema A');
    });
});
