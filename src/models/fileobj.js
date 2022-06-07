var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FileObjSchema = new Schema({
    owner: { type: Schema.Types.ObjectId, ref: 'User' },
    filename: {
        type: String,
        required: true,
        trim: true
    },
    description: String,
    filepath: {
        type: String,
        required: true,
        trim: true
    },
    url: {
        type: String,
        required: true,
        trim: true
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('FileObj', FileObjSchema);