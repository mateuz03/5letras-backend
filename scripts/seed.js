// Popula o banco com os dados de demonstração (motels, recompensas e usuário demo).
// Idempotente: se já existirem motels, não insere nada.
//
// Uso (com o Atlas na variável de ambiente):
//   MONGO_URI="mongodb+srv://..." npm run seed
require('dotenv').config();

async function main() {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
        console.error('Defina MONGO_URI antes de rodar o seed. Ex.:');
        console.error('  MONGO_URI="mongodb+srv://..." npm run seed');
        process.exit(1);
    }
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'seed-local';

    const mongoose = require('mongoose');
    await mongoose.connect(mongoUri);
    console.log('Conectado ao banco.');

    const Motel = require('../models/Motel');
    const Reward = require('../models/Reward');
    const User = require('../models/User');

    const existing = await Motel.countDocuments();
    if (existing > 0) {
        console.log(`O banco já possui ${existing} motel(is) — seed ignorado.`);
        await mongoose.disconnect();
        return;
    }

    await Motel.create([
        {
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
        },
        {
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
        }
    ]);

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

    console.log('Seed concluído: 2 motels, 3 recompensas e o usuário demo@5letras.com / demo123.');
    await mongoose.disconnect();
}

main().catch((err) => {
    console.error('Seed falhou:', err.message);
    process.exit(1);
});
