require('dotenv').config()
const {config} =  require('cloudinary');


const CLOUDINARY_CLOUD_NAME = 'dqlz3vcea'
const CLOUDINARY_API_KEY = '682723734294982'
const CLOUDINARY_API_SECRET = 'cYyOtpZUjl5IxuhOitPnPaoouFY'


const cloudinaryConfig = function (req, res, next) {
    config({
        cloud_name : CLOUDINARY_CLOUD_NAME,//process.env.CLOUDINARY_CLOUD_NAME,
        api_key: CLOUDINARY_API_KEY, //process.env.CLOUDINARY_API_KEY,
        api_secret: CLOUDINARY_API_SECRET // process.env.CLOUDINARY_API_SECRET
    });
   
    next()
}

module.exports = cloudinaryConfig;
