const request = require('supertest');
const app = require('../index');
const User = require('../models/User');
const { registerAndLogin } = require('./utils');

describe('POST /api/users/register', () => {
    test('cria usuário e criptografa a senha', async () => {
        const res = await request(app)
            .post('/api/users/register')
            .send({ name: 'Ana', email: 'ana@test.com', password: 'senha123' });

        expect(res.status).toBe(201);
        expect(res.body.message).toBe('Usuário criado com sucesso!');

        const user = await User.findOne({ email: 'ana@test.com' });
        expect(user).not.toBeNull();
        expect(user.password).not.toBe('senha123');
    });

    test('retorna 400 quando faltam campos', async () => {
        const res = await request(app)
            .post('/api/users/register')
            .send({ name: 'Ana' });

        expect(res.status).toBe(400);
    });

    test('retorna 400 para e-mail duplicado', async () => {
        await request(app)
            .post('/api/users/register')
            .send({ name: 'Ana', email: 'dup@test.com', password: 'senha123' });

        const res = await request(app)
            .post('/api/users/register')
            .send({ name: 'Ana 2', email: 'dup@test.com', password: 'senha123' });

        expect(res.status).toBe(400);
    });
});

describe('POST /api/users/login', () => {
    test('retorna token com credenciais válidas', async () => {
        await request(app)
            .post('/api/users/register')
            .send({ name: 'Bruno', email: 'bruno@test.com', password: 'senha123' });

        const res = await request(app)
            .post('/api/users/login')
            .send({ email: 'bruno@test.com', password: 'senha123' });

        expect(res.status).toBe(200);
        expect(res.body.token).toBeDefined();
    });

    test('retorna 401 com senha errada', async () => {
        await request(app)
            .post('/api/users/register')
            .send({ name: 'Bruno', email: 'bruno2@test.com', password: 'senha123' });

        const res = await request(app)
            .post('/api/users/login')
            .send({ email: 'bruno2@test.com', password: 'errada' });

        expect(res.status).toBe(401);
    });
});

describe('GET /api/users/me', () => {
    test('retorna 401 sem token', async () => {
        const res = await request(app).get('/api/users/me');
        expect(res.status).toBe(401);
    });

    test('retorna o perfil sem a senha', async () => {
        const token = await registerAndLogin('carla@test.com');

        const res = await request(app)
            .get('/api/users/me')
            .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body.email).toBe('carla@test.com');
        expect(res.body.password).toBeUndefined();
    });
});

describe('PUT /api/users/me', () => {
    test('retorna 400 ao tentar usar e-mail já cadastrado por outro usuário', async () => {
        const token = await registerAndLogin('fabio@test.com');
        await request(app)
            .post('/api/users/register')
            .send({ name: 'Gabi', email: 'gabi@test.com', password: 'senha123' });

        const res = await request(app)
            .put('/api/users/me')
            .set('x-auth-token', token)
            .send({ email: 'gabi@test.com' });

        expect(res.status).toBe(400);
    });

    test('permite manter o próprio e-mail', async () => {
        const token = await registerAndLogin('helio@test.com');

        const res = await request(app)
            .put('/api/users/me')
            .set('x-auth-token', token)
            .send({ email: 'helio@test.com', name: 'Hélio Novo' });

        expect(res.status).toBe(200);
        expect(res.body.email).toBe('helio@test.com');
    });

    test('atualiza o nome', async () => {
        const token = await registerAndLogin('diego@test.com');

        const res = await request(app)
            .put('/api/users/me')
            .set('x-auth-token', token)
            .send({ name: 'Diego Silva' });

        expect(res.status).toBe(200);
        expect(res.body.name).toBe('Diego Silva');
    });

    test('atualiza a senha e a nova senha funciona no login', async () => {
        const token = await registerAndLogin('elisa@test.com');

        const res = await request(app)
            .put('/api/users/me')
            .set('x-auth-token', token)
            .send({ password: 'novaSenha456' });
        expect(res.status).toBe(200);

        const login = await request(app)
            .post('/api/users/login')
            .send({ email: 'elisa@test.com', password: 'novaSenha456' });
        expect(login.status).toBe(200);
    });
});
