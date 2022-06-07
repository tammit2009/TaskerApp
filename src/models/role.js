const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema({

    rolename: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    groups: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role'
    }]
});

// // virtual relationship mapping
// RoleSchema.virtual('group', {
//     ref: 'Group',
//     localField: '_id',
//     foreignField: 'role'
// });

const Role = mongoose.model('Role', RoleSchema);

module.exports = Role;