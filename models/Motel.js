const mongoose = require('mongoose');

// Definimos primeiro o "molde" de uma suíte
const suiteSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: String, required: true },
    image: { type: String, required: true },
    amenities: [String] // Uma lista de strings, ex: ["Hidro", "Sauna"]
});

// Agora, usamos o molde da suíte dentro do molde do motel
const motelSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    rating: { type: Number, default: 0 },
    image: { type: String, required: true },
    distance: { type: String },
    description: { type: String },
    images: [String],
    suites: [suiteSchema] // Um motel tem uma lista de suítes
});

module.exports = mongoose.model('Motel', motelSchema);