const mongoose = require('mongoose');

const ProductivitySchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    task: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Task'
    }
}, {
    timestamps: true
});

const Productivity = mongoose.model('Productivity', ProductivitySchema);

module.exports = Productivity;