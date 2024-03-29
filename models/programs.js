const mongoose = require('mongoose');
const Schema = mongoose.Schema;
require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;


const moduleSchema = new Schema({
    module:{
        type:String
    }},{
        timestamps:true
    })


const programSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    image_name: {
        type:String,
    },
    image_url:{
        type: String,
    },
    description: {
        type: String,
        required: true
    },
    modules: [moduleSchema],
    price: {
        type: Currency,
        min: 0,
    },    
    duration: {
        type:String,
    },
    prerequisite: {
        type:String,
    },
    featured: {
        type: Boolean,
        default: false
    },},{
        timestamps: true
    }
);

programSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
}); 


let Programs = mongoose.model('Program', programSchema);

module.exports = Programs;
