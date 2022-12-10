const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StuffSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    designation: {
        type: String,
        required: true
    },
    description: {
        type: String,
    }
});

StuffSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
}); 


let Stuffs = mongoose.model("Stuff", StuffSchema)
module.exports = Stuffs;