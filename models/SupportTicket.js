const mongoose = require('mongoose');
const { Schema } = mongoose;

const supportTicketSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    issueType: {
        type: String,
        enum: ['bug', 'payment', 'suggestion', 'other'],
        required: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['Aberto', 'Em Andamento', 'Resolvido'],
        default: 'Aberto'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('SupportTicket', supportTicketSchema);