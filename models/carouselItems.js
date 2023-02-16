const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const CarouselSchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    sub_title: {
        type:String
    },
    image_name: {
        type: String
    },
    image_url:{
        type: String
    },},{
        timestamps: true
    }
);

CarouselSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
}); 


let Carousels = mongoose.model('Carousel', CarouselSchema);

module.exports = Carousels;