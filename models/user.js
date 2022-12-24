var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

const User = new Schema({
    firstname:{
        type: String,
        default: ''
    },
    lastname: {
        type: String,
        default: ''
    },
    admin: {
        type: Boolean,
        default: false
    }
});
 /*this will aututhomatically add username field
  and encriypted password */
User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);