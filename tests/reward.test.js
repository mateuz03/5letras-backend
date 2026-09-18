const request = require('supertest');
const app = require('../index');
const Reward = require('../models/Reward');
const User = require('../models/User');
const { registerAndLogin } = require('./utils');

async function criarUsuarioComPontos(email, pontos) {
    const token = await registerAndLogin(email);
    const user = await User.findOne({ email });
    user.points = pontos;
    await user.save();
    return token;
}

async function criarAdmin(email) {
    await request(app)
        .post('/api/users/register')
        .send({ name: 'Admin', email, password: 'senha123' });
    await User.updateOne({ email }, { role: 'admin' });
    const res = await request(app)
        .post('/api/users/login')
        .send({ email, password: 'senha123' });
    return res.body.token;
}

describe('Rotas admin de recompensas', () => {
    test('usuário comum recebe 403 ao criar recompensa', async () => {
        const token = await criarUsuarioComPontos('comum@test.com', 0);

        const res = await request(app)
            .post('/api/rewards')
            .set('x-auth-token', token)
            .send({ title: 'R', description: 'D', points: 10 });

        expect(res.status).toBe(403);
    });

    test('admin cria e edita recompensa', async () => {
        const adminToken = await criarAdmin('admin@test.com');

        const created = await request(app)
            .post('/api/rewards')
            .set('x-auth-token', adminToken)
            .send({ title: 'Desconto 20%', description: 'D', points: 100 });
        expect(created.status).toBe(201);

        const updated = await request(app)
            .put(`/api/rewards/${created.body._id}`)
            .set('x-auth-token', adminToken)
            .send({ points: 150, isActive: false });

        expect(updated.status).toBe(200);
        expect(updated.body.points).toBe(150);
        expect(updated.body.isActive).toBe(false);
    });

    test('recompensa desativada não aparece na listagem pública', async () => {
        const adminToken = await criarAdmin('admin2@test.com');
        const created = await request(app)
            .post('/api/rewards')
            .set('x-auth-token', adminToken)
            .send({ title: 'Secreta', description: 'D', points: 100 });

        await request(app)
            .put(`/api/rewards/${created.body._id}`)
            .set('x-auth-token', adminToken)
            .send({ isActive: false });

        const res = await request(app).get('/api/rewards');
        expect(res.body).toHaveLength(0);
    });
});

describe('GET /api/rewards', () => {
    test('lista apenas recompensas ativas, ordenadas por pontos', async () => {
        await Reward.create([
            { title: 'Barata', description: 'D', points: 50, isActive: true },
            { title: 'Cara', description: 'D', points: 500, isActive: true },
            { title: 'Inativa', description: 'D', points: 10, isActive: false }
        ]);

        const res = await request(app).get('/api/rewards');

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(2);
        expect(res.body[0].points).toBe(50);
    });
});

describe('POST /api/rewards/redeem/:id', () => {
    test('retorna 401 sem token', async () => {
        const reward = await Reward.create({ title: 'R', description: 'D', points: 10 });
        const res = await request(app).post(`/api/rewards/redeem/${reward._id}`);
        expect(res.status).toBe(401);
    });

    test('deduz os pontos ao resgatar', async () => {
        const reward = await Reward.create({ title: 'R', description: 'D', points: 30 });
        const token = await criarUsuarioComPontos('rico@test.com', 100);

        const res = await request(app)
            .post(`/api/rewards/redeem/${reward._id}`)
            .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body.newPoints).toBe(70);
    });

    test('retorna 400 com pontos insuficientes', async () => {
        const reward = await Reward.create({ title: 'R', description: 'D', points: 999 });
        const token = await criarUsuarioComPontos('pobre@test.com', 10);

        const res = await request(app)
            .post(`/api/rewards/redeem/${reward._id}`)
            .set('x-auth-token', token);

        expect(res.status).toBe(400);
    });

    test('retorna 404 para recompensa inexistente', async () => {
        const token = await criarUsuarioComPontos('user@test.com', 100);

        const res = await request(app)
            .post('/api/rewards/redeem/000000000000000000000000')
            .set('x-auth-token', token);

        expect(res.status).toBe(404);
    });

    test('impede resgatar a mesma recompensa duas vezes', async () => {
        const reward = await Reward.create({ title: 'R', description: 'D', points: 20 });
        const token = await criarUsuarioComPontos('unico@test.com', 100);

        const first = await request(app)
            .post(`/api/rewards/redeem/${reward._id}`)
            .set('x-auth-token', token);
        expect(first.status).toBe(200);

        const second = await request(app)
            .post(`/api/rewards/redeem/${reward._id}`)
            .set('x-auth-token', token);
        expect(second.status).toBe(400);

        // Pontos deduzidos apenas uma vez
        const user = await User.findOne({ email: 'unico@test.com' });
        expect(user.points).toBe(80);
    });
});

describe('GET /api/rewards/my-redemptions', () => {
    test('retorna os resgates do usuário com os dados da recompensa', async () => {
        const reward = await Reward.create({ title: 'Desconto', description: 'D', points: 20 });
        const token = await criarUsuarioComPontos('resgata@test.com', 100);

        await request(app)
            .post(`/api/rewards/redeem/${reward._id}`)
            .set('x-auth-token', token);

        const res = await request(app)
            .get('/api/rewards/my-redemptions')
            .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].pointsSpent).toBe(20);
        expect(res.body[0].reward.title).toBe('Desconto');
    });

    test('retorna lista vazia para usuário sem resgates', async () => {
        const token = await criarUsuarioComPontos('semresgates@test.com', 0);

        const res = await request(app)
            .get('/api/rewards/my-redemptions')
            .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(0);
    });
});
