var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var passport = require('passport');
var cloudinaryConfig = require('../cloudinaryConfig')
require('dotenv').config();

//netify
const serverless = require('serverless-http');

var indexRouter = require('../routes/index');
var usersRouter = require('../routes/users');
var programRouter = require('../routes/programRouter');
var studentRouter = require('../routes/studentRouter');
var carouselRouter = require('../routes/carouselRouter');
var feedbackRouter = require('../routes/feedbackRouter')
var classRouter = require('../routes/classRouter');
var stuffRouter = require('../routes/stuffRouter');

const mongoose = require('mongoose');

//mongodb atalas
const uri = process.env.Mongodb_Atlast_Url;

const connectionParams={
  useNewUrlParser: true,
  useUnifiedTopology: true
}

const connect = mongoose.connect(uri, connectionParams);
//connect with the mongoDB
connect.then((db)=>{
  console.log("Connected correctly to server");
},(err)=>{console.log(err); });
/*

//local mongodb 
const url = process.env.MongoUrl;

const connect = mongoose.connect(url);
//connect with the mongoDB
connect.then((db)=>{
  console.log("Connected correctly to server");
},(err)=>{console.log(err); });
*/

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser());

//initialize passport
app.use(passport.initialize());

//cloudinary
app.use(cloudinaryConfig)

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/programs', programRouter);
app.use('/students', studentRouter);
app.use('/carousels', carouselRouter);
app.use('/feedbacks', feedbackRouter);
app.use('/classes', classRouter);
app.use('/stuffs', stuffRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports.handler = serverless(app);



