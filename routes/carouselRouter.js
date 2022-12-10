const express = require('express');
const bodyParser =require('body-parser');
const cors = require('./cors');
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
const Carousels = require('../models/carouselItems');

const carouselRouter = express.Router()

carouselRouter.use(bodyParser.json());

carouselRouter.route('/')
.options(cors.corsWithOptions, (req,res)=>{res.sendStatus(200)})
.get(cors.cors,(req, res, next)=>{
    //getmany in admin
    if(req.query.range === undefined){  
        if(req.query.filter){
            let query = JSON.parse(req.query.filter);
            let {id, ...newQuery} = query
            req.query = newQuery
            req.query['_id'] = []
            
            if("id" in query){
                query['id'].forEach(id => {
                    req.query['_id'].push(id)
                })
            }
        }
        Carousels.find(req.query)
        .then((carousels)=>{
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');            
            res.json(carousels);
        }).catch((err)=> next(err));
    } else{
        let searchQ = JSON.parse(req.query.filter);
        let rangeFilter = JSON.parse(req.query.range);
        let sortF = JSON.parse(req.query.sort);
        let {filter, range, sort , ...query} = req.query;
        req.query = query;   //update req.query.

    Carousels.find(req.query)
    .then((carousels)=>{
        if(searchQ.q){      //support for search
            let search = searchQ.q.toLowerCase();
            let preMatched = carousels;
            if(searchQ.id) {
                let searchId = searchQ.id.toLowerCase();  
                preMatched = carousels.filter(carousel =>carousel.id.toLowerCase().includes(searchId));
             }
            const matched = preMatched.filter(carousel =>carousel.name.toLowerCase().includes(search));
             
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Range', `matched 0 - 10 /${matched.length}`);
            res.setHeader('Access-Control-Expose-Headers', 'Content-Range');
            matched.sort((p1,p2)=>{
                if(sortF[1] === "ASC") return p1[sortF[0]].localeCompare(p2[sortF[0]]);
                                    else return p2[sortF[0]].localeCompare(p1[sortF[0]]); });
            res.json(matched.slice(rangeFilter[0],rangeFilter[1]));
        }else{
            console.log(carousels.length);            
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');            
            res.setHeader('Content-Range',  `carousels 0 - 10 / ${carousels.length}`);
            res.setHeader('Access-Control-Expose-Headers', 'Content-Range');
            carousels.sort((p1,p2)=>{
                if(sortF[1] === "ASC") return p1[sortF[0]].localeCompare(p2[sortF[0]]);
                                    else return p2[sortF[0]].localeCompare(p1[sortF[0]]); });
            res.json(carousels.slice(rangeFilter[0],rangeFilter[1]));
        }        
    })
    .catch((err)=> next(err));
    }
    
})
.post(cors.corsWithOptions,upload.single('imageFile'),(req, res, next)=>{
    
    //post without image should be disalled image required is true.
    let data;
    if(req.file){
        let imagePath = req.file.path;
        imagePath =imagePath.replace('public/','');
        data = JSON.parse(req.body.datas);
        data.image = imagePath;
    } else {
        data = JSON.parse(req.body.datas);
    }
    
    Carousels.create(data)
    .then((carousel)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(carousel)
    })
    .catch((err)=> next(err));
})
.put(cors.corsWithOptions,(req, res, next)=>{
    res.statusCode = 403;
    res.end("PUT operation not supported on /carousels");
})
.delete(cors.corsWithOptions,(req, res, next)=>{
    
    let arrayId =  JSON.parse(req.query.filter).id;
     for(let id of arrayId){
        Carousels.findByIdAndRemove(id)
        .then(res=>{
            console.log(" ");
        })
        .catch(err => console.log(err));
    }
    
    Carousels.find({})
    .then((carousels)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(carousels);
    })
    .catch((err)=> next(err));
});



//with id
carouselRouter.route('/:carouselId')
.options(cors.corsWithOptions, (req,res)=>{res.sendStatus(200)})
.get(cors.cors,(req, res, next)=>{
    Carousels.findById(req.params.carouselId)
    .then((carousel)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(carousel);
    })
    .catch((err)=> next(err));
})
.post(cors.corsWithOptions,(req,res, next)=>{
    res.statusCode = 403;
    res.end('POST operation not supported on /carousels/' + req.params.carouselId);
})
.put(cors.corsWithOptions,upload.single('imageFile'),(req, res, next)=>{
    
    let data;
    if(req.file){
        let imagePath = req.file.path;
        imagePath =imagePath.replace('public/','');
        data = JSON.parse(req.body.datas);
        console.log(data.image);
        let path = data.image;
        //if it is not the same image then delete
        if(imagePath !== path){
            fs.unlink('public/'+path, (err)=>{
                if(err) console.error(err);
                else console.log('public/'+path, 'was deleted');
            })
        }         
                
        data.image = imagePath;
    } else {
        data = JSON.parse(req.body.datas);
    }
    
    Carousels.findByIdAndUpdate(req.params.carouselId, {
        $set:  data  //req.body
    }, {new: true})
    .then((carousel)=>{
        Carousels.findById(carousel.id)
        .then((carousel)=>{
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(carousel);
        },(err)=> next(err))
    })
    .catch((err)=> next(err));
})
.delete(cors.corsWithOptions,(req, res, next)=>{

    //also delete the image
    data = JSON.parse(req.body.datas);
    console.log(data.image);
    let path = data.image;
    //delete old image         
    fs.unlink('public/'+path, (err)=>{
        if(err) console.error(err);
        else console.log(path, 'was deleted');
    })

    //delete the program
    Carousels.findByIdAndRemove(req.params.carouselId)
    .then((resp)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    })
    .catch((err)=>next(err));
})

module.exports = carouselRouter;