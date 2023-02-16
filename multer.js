const multer = require('multer')
//const Datauri = require('datauri')
const path = require('path')

const DatauriParser=require("datauri/parser");
const parser = new DatauriParser();

//image filter
const imageFileFilter = (req, file, cb)=>{
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('You can upload only image files!'), false);
    }
    cb(null, true);
};

const storage = multer.memoryStorage(); 
const multerUploads = multer({storage: storage, fileFilter: imageFileFilter}).single('imageFile');
//const dUri = new Datauri();

const dataUri = req => 
    parser.format(path.extname(req.file.originalname).toString(), req.file.buffer);

const fileName = req => (req.file.originalname).toString();

module.exports = { multerUploads,  dataUri, fileName};