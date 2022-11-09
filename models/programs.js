const mongoose = require('mongoose');
const Schema = mongoose.Schema;
require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;


const moduleSchema = new Schema({
    module:{
        type:String,
        required: true
    }},{
        timestamps:true
    })


const programSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    image: {
        type:String
    },
    description: {
        type: String,
        required: true
    },
    modules: [moduleSchema],
    price: {
        type: Currency,
        required: true,
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
    virtuals: true
});


let Programs = mongoose.model('Program', programSchema);

module.exports = Programs;
