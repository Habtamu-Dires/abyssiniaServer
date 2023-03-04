require('dotenv').config();

/*
const {config} =  require('cloudinary').v2;

const cloudinaryConfig = function (req, res, next) {
    config({
        cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true
    });
   
    next()
}

module.exports = cloudinaryConfig;
*/
const cloudinary = require('cloudinary').v2;

const CLOUDINARY_CLOUD_NAME = 'dqlz3vcea';
const CLOUDINARY_API_KEY = '682723734294982';
const CLOUDINARY_API_SECRET = 'cYyOtpZUjl5IxuhOitPnPaoouFY';


cloudinary.config({
    cloud_name :  CLOUDINARY_CLOUD_NAME, //process.env.CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY, //process.env.CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET, //process.env.CLOUDINARY_API_SECRET,
    //secure: true
})

module.exports = cloudinary;