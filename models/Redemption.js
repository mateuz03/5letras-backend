const mongoose = require('mongoose');
const { Schema } = mongoose;

const redemptionSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reward: {
        type: Schema.Types.ObjectId,
        ref: 'Reward',
        required: true
    },
    pointsSpent: {
        type: Number,
        required: true
    },
    redeemedAt: {
        type: Date,
        default: Date.now
    }
});

// Um usuário só pode resgatar cada recompensa uma única vez
redemptionSchema.index({ user: 1, reward: 1 }, { unique: true });

module.exports = mongoose.model('Redemption', redemptionSchema);
