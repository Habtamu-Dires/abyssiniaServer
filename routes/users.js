var express = require('express');
const bodyParser = require('body-parser');
var User = require('../models/user');
var passport = require('passport');
var authenticate = require('../authenticate');
var cors = require('./cors');
require('dotenv').config();
var nodemailer = require('nodemailer');
var handlebars = require('handlebars');
//temp 
const EMAIL = 'haft.adu@gmail.com';
const EMAIL_PASSWORD = 'aupjfytpamjeaekg'

var router = express.Router();

router.use(bodyParser.json());

/* GET users listing. */
router.options('*', cors.corsWithOptions, (req, res)=>{res.sendStatus(200);});
router.get('/' ,cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin ,function(req, res, next) {
    User.find({})
    .then((users)=>{
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(users);
    })
    .catch((err)=> next(err));
});

//temp
router.post('/signup' ,cors.corsWithOptions,/* authenticate.verifyUser, authenticate.verifyAdmin,*/ function(req,res,next){
  User.register(new User({username: req.body.username}), req.body.password, 
  (err, user)=>{
     if(err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.json({err: err});
     } else {
        if(req.body.name)
          user.name = req.body.name
        if(req.body.email)
          user.email = req.body.email
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

router.put('/update', cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next)=>{
 
  User.findByIdAndUpdate(req.user._id, {
      $set: req.body
  }, {new: true})
  .then((user)=>{
      console.log(user)
      User.findById(user._id)
      .then((user)=>{
          user.changePassword(req.body.oldpassword, req.body.newpassword, function(err){
            if(err) {
                  if(err.name === 'IncorrectPasswordError'){
                       res.json({ success: false, message: 'Incorrect password' }); // Return error
                  }else {
                      res.json({ success: false, message: 'Something went wrong!! Please try again after sometimes.' });
                  }
           } else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json({ success: true, message: 'Your password has been changed successfully' });
            }
          })
                    
      },(err)=> next(err))
  })
  .catch((err)=> next(err));
  
});

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

      const token = authenticate.getToken({_id: req.user._id});
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({success: true, status: 'Login Successful!', token: token, 
                  creds:{username: user.username, name: user.name, email: user.email}});
    }); 
  }) (req, res, next);
});


//temp
router.delete('/',cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next)=> {
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


//forget password request
router.post('/forgetPassword', cors.corsWithOptions,  async (req, res, next) => {
  const email = req.body.email;
  const user = await User.findOne({email})
  
  if(!user) {
    res.statusCode = 402;
    res.setHeader('Content-Type', 'application/json')
    return res.json({status: 'User does not exist'})
  }
  else{
    const resetToken = authenticate.getToken({_id: user._id});

    const clientURL = 'https://abyssinia-computer-engineering.netlify.app';
    const link = `${clientURL}/resetPassword?token=${resetToken}&id=${user._id}`;
    const source = `<h3>Hello, {{name}}</h3><br/>
                    <h4>You requested to reset your Abyssinia password</h4> 
                    <h4>Please, click the link below to reset your password</h4>
                    <a href='{{link}}'>Reset Password</a><br />
                    <p>Ignore this message if it was not you.</p>`;
    const template = handlebars.compile(source);
    const data = {"name": user.name,
                  "link": link}
    
    const thehtml = template(data);
    //send email

    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: EMAIL,//process.env.EMAIL,
        pass: EMAIL_PASSWORD //process.env.EMAIL_PASSWORD,
      }
    });

    var mailoptions = {
      from: 'haft.adu@gmail.com',
      to: user.email,
      subject: 'A link to reset your abyssinia password',
      html: thehtml
    };

    transporter.sendMail(mailoptions, function(error, info){
      if(error){
        res.statusCode = 403;
        res.setHeader('Content-Type', 'application/json')
        return res.json({status: `${error}`})

      } else {
        
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json')
        return res.json({status: `Email sent to: ${user.email}`})
      }
    });

  }
  
});

//Reset password request
router.put('/resetPassword', cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next)=>{
  console.log(req.body.userId);
  
  User.findById(req.body.userId)
  .then(user => {
      user.setPassword(req.body.newpassword, ()=>{
      user.save();

      const token = authenticate.getToken({_id: req.user._id});
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({success: true, status: 'password reset successful', token: token, 
                  creds:{username: user.username, name: user.name, email: user.email}})      
    });
    
  })
  .catch(err => next(err))
  
});


module.exports = router;
