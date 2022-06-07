const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Project'
    }
}, {
    timestamps: true
});

// virtual relationship mapping
TaskSchema.virtual('productivities', {
    ref: 'Productivity',
    localField: '_id',
    foreignField: 'task'
});

// to make populate work: by default, the virtual fields are not included in the output
TaskSchema.set('toObject', { virtuals: true });
TaskSchema.set('toJSON', { virtuals: true });

const Task = mongoose.model('Task', TaskSchema);

module.exports = Task;