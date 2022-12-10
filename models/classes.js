const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const studentSchema = new Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        unique: true,
        required:true
    }
});

const daySchema = new Schema({
    day:{
        type: String,
        required: true
    },
    partOfTheDay:{
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    }
})

const ClassSchema = new Schema({
    program: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Program',
        required: true
    },
    students: [studentSchema],
    schedule:[daySchema],
    classStartDate:{
        type: Date,
        required: true
    },
    classEndDate:{
        type: Date,
    },},{
        timestamps: true
    });


ClassSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
}); 


studentSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        //ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});


daySchema.set('toJSON', {
    transform: function (doc, ret, options) {
        //ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
}); 


let Classes = mongoose.model('Class', ClassSchema);

module.exports = Classes;