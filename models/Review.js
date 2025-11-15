const mongoose = require('mongoose');
const { Schema } = mongoose;

const reviewSchema = new Schema({
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
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
        validate: {
            validator: Number.isInteger,
            message: '{VALUE} não é um número inteiro para a nota.'
        }
    },
    comment: {
        type: String,
        required: true,
        trim: true,
        maxlength: [1000, 'O comentário não pode exceder 1000 caracteres.']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Review', reviewSchema);