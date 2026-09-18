const request = require('supertest');
const app = require('../index');

describe('GET /health', () => {
    test('retorna status ok e estado do MongoDB', async () => {
        const res = await request(app).get('/health');

        expect(res.status).toBe(200);
        expect(res.body.status).toBe('ok');
        expect(res.body.mongodb).toBe('conectado');
    });
});
