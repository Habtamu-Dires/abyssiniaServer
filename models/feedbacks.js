const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const FeedbackSchema = new Schema({
    name: {
        type: String,
    },
    phone: {
        type:String,
    },
    email: {
        type: String,
    },
    mayWeContactYou: {
        type: Boolean,
        default: false
    },
    contactWay:{
        type: String,
        default: 'tel'
    },   
    feedback: {
        type:String,
        required: true
    },},{
        timestamps: true
    }
);

FeedbackSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
}); 


let Feedbacks = mongoose.model('Feedback', FeedbackSchema);

module.exports = Feedbacks;