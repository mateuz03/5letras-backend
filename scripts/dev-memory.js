// Servidor de desenvolvimento com MongoDB em memória + dados de demonstração.
// Uso:  npm run dev:memory   (dentro da pasta 5letras-backend)
require('dotenv').config();

async function main() {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongo = await MongoMemoryServer.create();
    process.env.MONGO_URI = mongo.getUri();
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'segredo-dev-local';

    const mongoose = require('mongoose');
    await mongoose.connect(process.env.MONGO_URI);

    // Seed de demonstração
    const Motel = require('../models/Motel');
    const Reward = require('../models/Reward');
    const User = require('../models/User');

    await Motel.create({
        name: 'Refúgio Bourbon',
        location: 'Jardins, São Paulo - SP',
        rating: 4.9,
        image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
        description: 'Suítes intimistas com hidromassagem, iluminação cênica e total privacidade.',
        price: 'A partir de R$ 359',
        categories: ['Boutique', 'Romântico'],
        suites: [
            { name: 'Desejo', price: 359, image: 'x.jpg', amenities: ['Hidro', 'Cena de luz', 'Decoração com pétalas'] },
            { name: 'Íntima', price: 419, image: 'x.jpg', amenities: ['Hidro dupla', 'Sauna privativa'] },
            { name: 'Panorâmica', price: 429, image: 'x.jpg', amenities: ['Vista da cidade', 'Varanda privativa'] }
        ]
    });

    await Motel.create({
        name: 'Villa Chandon',
        location: 'Vila Madalena, São Paulo - SP',
        rating: 4.7,
        image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
        description: 'Um refúgio boutique com suítes temáticas e piscina privativa.',
        price: 'A partir de R$ 289',
        categories: ['Boutique', 'Temático'],
        suites: [
            { name: 'Champagne', price: 289, image: 'x.jpg', amenities: ['Piscina privativa', 'Ducha dupla'] },
            { name: 'Bordeaux', price: 339, image: 'x.jpg', amenities: ['Hidro', 'Lareira'] }
        ]
    });

    await Reward.create([
        { title: 'Espumante de cortesia', description: 'Uma taça de espumante na chegada da sua próxima estadia.', points: 200 },
        { title: 'Late checkout até 16h', description: 'Estenda sua estadia sem pressa.', points: 350 },
        { title: 'Noite com 20% de desconto', description: 'Desconto em uma diária em qualquer suíte.', points: 600 }
    ]);

    // A senha em texto plano: o hook pre-save do model faz o hash
    await User.create({
        name: 'Convidado Demo',
        email: 'demo@5letras.com',
        password: 'demo123',
        points: 750
    });

    const app = require('../index');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`[dev-memory] API em http://localhost:${PORT} (dados de demonstração)`);
        console.log('[dev-memory] Login demo: demo@5letras.com / demo123');
    });
}

main().catch((err) => {
    console.error('[dev-memory] Falhou:', err);
    process.exit(1);
});
