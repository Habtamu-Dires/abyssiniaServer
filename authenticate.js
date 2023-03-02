var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken');

require('dotenv').config();
//test
const Passport_SecretKey = '12345-67890-09876-54321'

//possport local strategy is based on username and password.
exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = function(user) {
    //inside jwt.sign(pay_load)
    // to create jwt usig jwt  //we imported                                                              
    return jwt.sign(user, Passport_SecretKey /*process.env.Passport_SecretKey */, {expiresIn: '43200m'}); //expiresIn: 30 days
};

var opts = {};
//from where to extrac jwt
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();  
opts.secretOrKey =  Passport_SecretKey;//process.env.Passport_SecretKey;  //old =  config.secretKey;


//configering JWT based strategy
//extract the payload based on opt
exports.jwtPassport = passport.use(new JwtStrategy(opts, 
    (jwt_payload, done) => {
        console.log("JWT payload: ", jwt_payload);
        User.findOne({_id: jwt_payload._id}, (err, user)=>{
            if (err) {
                return done(err, false); 
            }
            else if(user) {
                // passport will pass to ur strategy. req.user
                
                return done(null, user); 
            }
            else {
                return done(null, false);
            }      
        });
}));
//this one use token come form the req and authenticate --based on the strategy.
exports.verifyUser = passport.authenticate('jwt', {session: false}); 

//verifyAdmin
exports.verifyAdmin = (req,res,next) => {
    if(req.user.admin === true){
        return next();
    }
    else{
        err = new Error("You are not authorized");
        err.status = 403;
        return next(err);        
    } 
};

