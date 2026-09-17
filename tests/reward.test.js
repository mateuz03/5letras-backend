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
});
