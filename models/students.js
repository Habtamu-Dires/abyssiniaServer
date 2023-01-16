const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StudentSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    phone: {
        type:String,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    program: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Program'
    },
    otherProgram:{
        type: String
    }, 
    educationStatus: {
        type:String,
    },
    preferredDays: {
        type:String,
        required: true
    },
    preferredTime: {
        type: String,
        required: true
    },    
    enrolled: {
        type:Boolean,
        default: false
    },
    payment:{
        type:String,
    },
    programStartDate: {
        type:Date,
    },
    programEndDate: {
        type: Date,
    },
    certificateStatus:{
        type: Boolean,
        default: false
    },
    remark: {
        type:String,
    },},{
        timestamps: true
    }
);

StudentSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
}); 


let Students = mongoose.model('Student', StudentSchema);

module.exports = Students;