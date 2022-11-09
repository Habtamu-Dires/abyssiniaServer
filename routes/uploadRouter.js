const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const cors = require('./cors');

const storage = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, 'public/images');
    },
    filename:(req, file, cb)=>{
        cb(null, file.originalname);
    }
});

const imageFileFilter = (req, file, cb)=>{
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('You can upload only image files!'), false);
    }
    cb(null, true);
};

const upload = multer({storage: storage, fileFilter: imageFileFilter});

const Programs = require('../models/programs');

const uploadRouter = express.Router();

//uploadRouter.use(bodyParser.json()); // parse to js object find on req.body

uploadRouter.route('/')
.options(cors.corsWithOptions, (req,res)=>{res.sendStatus(200);})
.get(cors.cors, (req,res,next)=> {
    res.statusCode = 403;
    res.end('GET operation not supported on /imageUpload');
})                     
.post(cors.corsWithOptions,upload.single('imageFile'),(req,res)=> {
    //single -- only single file -- imageFile -- the name of the form in the client
    const description = req.body.description
    
    if(req.file) {
        const imagePath = req.file.path;
        res.send({description, imagePath})
    } else{
        res.send({description});
    }
    
    
    //res.send({description});
    //const data = JSON.parse(req.body.datas);
    //data.image = imagePath;

    
    
    
    //console.log(description, imagePath)
    //res.send({imagePath})
})
.put(cors.corsWithOptions, (req,res,next)=> {
    res.statusCode = 403;
    res.end('PUT operation not supported on /imageUpload');
})
.delete(cors.corsWithOptions,(req,res,next)=> {
    res.statusCode = 403;
    res.end('delete operation not supported on /imageUpload');
});


module.exports = uploadRouter;