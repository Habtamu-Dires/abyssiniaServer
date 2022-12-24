var express = require('express');
const bodyParser = require('body-parser');
var User = require('../models/user');
var passport = require('passport');
var authenticate = require('../authenticate');
var cors = require('./cors');


var router = express.Router();

router.use(bodyParser.json());

/* GET users listing. */
router.options('*', cors.corsWithOptions, (req, res)=>{res.sendStatus(200);});
router.get('/',authenticate.verifyUser, authenticate.verifyAdmin, function(req, res, next) {
    User.find({})
    .then((users)=>{
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(users);
    })
    .catch((err)=> next(err));
});

//temp
router.post('/signup', cors.corsWithOptions, (req,res,next)=>{
  User.register(new User({username: req.body.username}), req.body.password, 
  (err, user)=>{
     if(err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.json({err: err});
     } else {
        if(req.body.firstname)
          user.firstname = req.body.firstname
        if(req.body.lastname)
          user.lastname = req.body.lastname
        user.save((err,user)=>{
          if(err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.json({err: err});
            return;
          }
          passport.authenticate('local')(req,res,()=>{
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({success: true , status: 'Registration Successful'});
          });
        });
      }
  });
});

router.put('/update', authenticate.verifyUser, cors.corsWithOptions, (req, res, next)=>{

})

//the passport.authenticate('local ) will load up user prop on request message
router.post('/login', cors.corsWithOptions,(req,res, next)=>{
  passport.authenticate('local', (err, user, info) => {
    if (err)
      return next(err);

    if (!user) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.json({success: false, status: 'Login Unsuccessful!', err: info});
      return;
    }
    req.logIn(user, (err) => {
      if (err) {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: false, status: 'Login Unsuccessful!', err: 'Could not log in user!'});
        return;          
      }

      var token = authenticate.getToken({_id: req.user._id});
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({success: true, status: 'Login Successful!', token: token, 
                  creds:{username: user.username, firstname:user.firstname, lastname: user.lastname}});
    }); 
  }) (req, res, next);
});


//temp
router.delete('/',authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next)=> {
  User.remove({})
  .then((resp)=>{
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(resp);
  }, (err)=> next(err))
  .catch((err)=>next(err));

});


//will it check the expire time , how i'm gonna use this ...??
router.get('/checkJWTToken', cors.corsWithOptions, (req,res)=>{
  passport.authenticate('jwt', {session: false}, (err, user, info)=>{
    if(err){
      
      return next(err);

    } else if(!user) {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        return res.json({status: 'JWT invalid', success: false, err: info});
    } else {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.json({status: 'JWT valid!', success: true, user: user})
    }
  }) (req, res);
});



module.exports = router;
