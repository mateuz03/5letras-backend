// Migração de preços dos motéis.
//
// Formato definitivo decidido:
//   - suites[].price  -> Number (preço real em reais, usado para filtros e cálculos)
//   - Motel.price     -> String de exibição (ex: "A partir de R$ 120")
//
// O que este script faz em cada motel do Atlas:
//   1. Converte suites[].price de String para Number ("R$ 120" -> 120);
//      suítes sem preço válido são sinalizadas no relatório.
//   2. Preenche Motel.price a partir da suíte mais barata, se estiver vazio.
//
// Uso:  npm run migrate:prices
//       (requer MONGO_URI no .env)

require('dotenv').config();
const mongoose = require('mongoose');

function parsePriceToNumber(value) {
    if (typeof value === 'number' && !isNaN(value)) return value;
    if (typeof value !== 'string') return null;

    const digits = value.replace(/[^\d,.-]/g, '').replace(',', '.');
    const num = parseFloat(digits);
    return isNaN(num) ? null : num;
}

async function migrate() {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        console.error('❌ Defina MONGO_URI no .env antes de rodar a migração.');
        process.exit(1);
    }

    await mongoose.connect(uri);
    const Motel = mongoose.connection.collection('motels');

    const motels = await Motel.find({}).toArray();
    let motelsChanged = 0;
    let suitesConverted = 0;
    const problems = [];

    for (const motel of motels) {
        let changed = false;
        const suites = Array.isArray(motel.suites) ? motel.suites : [];

        // 1. Preços de suíte: string -> número
        suites.forEach((suite, i) => {
            const num = parsePriceToNumber(suite.price);
            if (num === null) {
                problems.push(`${motel.name} -> suíte "${suite.name || i}" tem preço inválido: ${JSON.stringify(suite.price)}`);
            } else if (suite.price !== num) {
                suite.price = num;
                suitesConverted += 1;
                changed = true;
            }
        });

        // 2. Preço de exibição do motel a partir da suíte mais barata
        const suitePrices = suites
            .map((s) => parsePriceToNumber(s.price))
            .filter((p) => p !== null);
        const minPrice = suitePrices.length > 0 ? Math.min(...suitePrices) : null;

        if (!motel.price && minPrice !== null) {
            motel.price = `A partir de R$ ${minPrice}`;
            changed = true;
        }

        if (changed) {
            await Motel.updateOne({ _id: motel._id }, { $set: { suites, price: motel.price } });
            motelsChanged += 1;
        }
    }

    console.log(`\n📊 Migração concluída:`);
    console.log(`   - Motéis processados: ${motels.length}`);
    console.log(`   - Motéis atualizados: ${motelsChanged}`);
    console.log(`   - Preços de suíte convertidos: ${suitesConverted}`);
    if (problems.length > 0) {
        console.log(`\n⚠️  Preços que precisam de ajuste manual (${problems.length}):`);
        problems.forEach((p) => console.log(`   - ${p}`));
    }

    await mongoose.disconnect();
}

migrate().catch((err) => {
    console.error('❌ Erro na migração:', err);
    process.exit(1);
});
