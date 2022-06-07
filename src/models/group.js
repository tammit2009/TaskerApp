const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
    groupname: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    roles: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role'
    }],
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
});

// // virtual relationship mapping
// GroupSchema.virtual('roles', {
//     ref: 'Role',
//     localField: '_id',
//     foreignField: 'group'
// });

// // virtual relationship mapping
// GroupSchema.virtual('users', {
//     ref: 'User',
//     localField: '_id',
//     foreignField: 'group'
// });

const Group = mongoose.model('Group', GroupSchema);

module.exports = Group;