const express = require('express');
const bodyParser =require('body-parser');
const cors = require('./cors');
const queryOp = require('./queryOp');
const multer = require('multer');
const fs = require('fs');

//imageUpload
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

//normal
const Programs = require('../models/programs');

const programRouter = express.Router();

programRouter.use(bodyParser.json());

programRouter.route('/')
.options(cors.corsWithOptions, (req,res)=>{res.sendStatus(200)})
.get(cors.cors,(req, res, next)=>{
    console.log('query');
    console.log(req.query);
    if(req.query.range === undefined){  //temp
        Programs.find(req.query)
        .then((programs)=>{
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');            
            res.json(programs);
        }).catch((err)=> next(err));
    } else{
        let searchQ = JSON.parse(req.query.filter);
        let rangeFilter = JSON.parse(req.query.range);
        let sortF = JSON.parse(req.query.sort);
        let {filter, range, sort , ...query} = req.query;
        req.query = query;   //update req.query.

    Programs.find(req.query)
    .then((programs)=>{
        if(searchQ.q){      //support for search
            let search = searchQ.q.toLowerCase();
            let preMatched = programs;
            if(searchQ.id) {
                let searchId = searchQ.id.toLowerCase();  
                preMatched = programs.filter(program =>program.id.toLowerCase().includes(searchId));
             }
            const matched = preMatched.filter(program =>program.name.toLowerCase().includes(search));
             
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Range', `matched 0 - 10 /${matched.length}`);
            res.setHeader('Access-Control-Expose-Headers', 'Content-Range');
            matched.sort((p1,p2)=>{
                if(sortF[1] === "ASC") return p1[sortF[0]].localeCompare(p2[sortF[0]]);
                                    else return p2[sortF[0]].localeCompare(p1[sortF[0]]); });
            res.json(matched.slice(rangeFilter[0],rangeFilter[1]));
        }else{
            console.log(programs.length);            
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');            
            res.setHeader('Content-Range',  `programs 0 - 10 / ${programs.length}`);
            res.setHeader('Access-Control-Expose-Headers', 'Content-Range');
            programs.sort((p1,p2)=>{
                if(sortF[1] === "ASC") return p1[sortF[0]].localeCompare(p2[sortF[0]]);
                                    else return p2[sortF[0]].localeCompare(p1[sortF[0]]); });
            res.json(programs.slice(rangeFilter[0],rangeFilter[1]));
        }        
    })
    .catch((err)=> next(err));
    }
    
})
.post(cors.corsWithOptions,upload.single('imageFile'),(req, res, next)=>{
    let data;
    if(req.file){
        const imagePath = req.file.path;
        data = JSON.parse(req.body.datas);
        data.image = imagePath;
    } else {
        data = req.body
    }
    
    Programs.create(data)
    .then((program)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(program)
    })
    .catch((err)=> next(err));
})
.put(cors.corsWithOptions,(req, res, next)=>{
    res.statusCode = 403;
    res.end("PUT operation not supported on /programs");
})
.delete(cors.corsWithOptions,(req, res, next)=>{
    
    let arrayId =  JSON.parse(req.query.filter).id;
     for(let id of arrayId){
        Programs.findByIdAndRemove(id)
        .then(res=>{
            console.log(" ");
        })
        .catch(err => console.log(err));
    }
    
    Programs.find({})
    .then((programs)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(programs);
    })
    .catch((err)=> next(err));
});



//with id
programRouter.route('/:programId')
.options(cors.corsWithOptions, (req,res)=>{res.sendStatus(200)})
.get(cors.cors,(req, res, next)=>{
    Programs.findById(req.params.programId)
    .then((program)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(program);
    })
    .catch((err)=> next(err));
})
.post(cors.corsWithOptions,(req,res, next)=>{
    res.statusCode = 403;
    res.end('POST operation not supported on /programs/' + req.params.programId);
})
.put(cors.corsWithOptions,upload.single('imageFile'),(req, res, next)=>{
    
    let data;
    if(req.file){
        const imagePath = req.file.path;
        data = JSON.parse(req.body.datas);
        console.log(data.image);
        let path = data.image;
        //delete old image         
        fs.unlink(path, (err)=>{
            if(err) console.error(err);
            else console.log(path, 'was deleted');
        })
        
        data.image = imagePath;
    } else {
        data = JSON.parse(req.body.datas);
    }
    
    Programs.findByIdAndUpdate(req.params.programId, {
        $set:  data  //req.body
    }, {new: true})
    .then((program)=>{
        Programs.findById(program.id)
        .then((program)=>{
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(program);
        },(err)=> next(err))
    })
    .catch((err)=> next(err));
})
.delete(cors.corsWithOptions,(req, res, next)=>{
    Programs.findByIdAndRemove(req.params.programId)
    .then((resp)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    })
    .catch((err)=>next(err));
})

module.exports = programRouter;