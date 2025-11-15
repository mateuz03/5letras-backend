const mongoose = require('mongoose');
const { Schema } = mongoose;

const reservationSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    motel: {
        type: Schema.Types.ObjectId,
        ref: 'Motel',
        required: true
    },
    suite: {
        suiteId: { type: String, required: true },
        name: { type: String, required: true }
    },
    period: {
        label: { type: String, required: true },
        price: { type: Number, required: true }
    },
    addons: [{
        name: { type: String },
        price: { type: Number }
    }],
    total: {
        type: Number,
        required: true
    },
    bookingDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['Confirmada', 'Finalizada', 'Cancelada'],
        default: 'Confirmada'
    }
});

module.exports = mongoose.model('Reservation', reservationSchema);