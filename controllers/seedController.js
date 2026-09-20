// Seed bootstrap: popula o banco na primeira execução em produção.
// Segurança: só funciona enquanto o banco estiver vazio — depois da primeira
// chamada, sempre responde 409. Para repopular, limpe as coleções no Atlas.
const Motel = require('../models/Motel');
const Reward = require('../models/Reward');
const User = require('../models/User');

exports.seedIfEmpty = async (req, res, next) => {
    try {
        const existing = await Motel.countDocuments();
        if (existing > 0) {
            res.status(409);
            throw new Error('Banco já inicializado. Rota de seed desativada.');
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

        // Senha em texto plano: o hook pre-save do model faz o hash
        await User.create({
            name: 'Convidado Demo',
            email: 'demo@5letras.com',
            password: 'demo123',
            points: 750
        });

        res.status(201).json({ success: true, message: 'Banco populado: 2 motels, 3 recompensas, usuário demo.' });
    } catch (err) {
        next(err);
    }
};
