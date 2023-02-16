const express = require('express');
const bodyParser =require('body-parser');
const cors = require('./cors');
const multer = require('multer');
const fs = require('fs');
const authenticate = require('../authenticate');


//cloudinary image upload with multer
const {multerUploads, dataUri, fileName}  = require('../multer');
const cloudinary = require('cloudinary').v2


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
.post(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin,multerUploads,(req, res, next)=>{
    
    //post without image should be disabled image required is true.
    const data = JSON.parse(req.body.datas)
    if(req.file) {
        const file = dataUri(req).content;
        const file_name = fileName(req);
        cloudinary.uploader.upload(file, {public_id: file_name ,folder: 'abyssinia'})
          .then((result)=>{ 
            data.image_url = result.url;
            data.image_name = result.public_id;
            Carousels.create(data)
            .then((carousel)=>{
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(carousel)
            })
            .catch((err)=> next(err));
            
          })
          .catch(err => next(err))    
    } else{
        Carousels.create(data)
        .then((carousel)=>{
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(carousel)
        })
        .catch((err)=> next(err));
    }
    
})
.put(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin,(req, res, next)=>{
    res.statusCode = 403;
    res.end("PUT operation not supported on /carousels");
})
.delete(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin,(req, res, next)=>{
    
    let arrayId =  JSON.parse(req.query.filter).id;
     for(let id of arrayId){
        Carousels.findByIdAndRemove(id)
        .then(res=>{
            return cloudinary.uploader.destroy(res.image_name, {public_id: res.image_name}, function(error, result){
                console.log(result, error);
            })
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
.post(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin,(req,res, next)=>{
    res.statusCode = 403;
    res.end('POST operation not supported on /carousels/' + req.params.carouselId);
})
.put(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin,multerUploads,(req, res, next)=>{
    
    const data = JSON.parse(req.body.datas)
    const oldImage = data.image_name;
    
    if(req.file){
        const file = dataUri(req).content;
        const file_name = fileName(req);
        cloudinary.uploader.upload(file, {public_id: file_name ,folder: 'abyssinia'})
          .then((result)=>{         
            data.image_url = result.url;
            data.image_name = result.public_id;
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
          }) //then delete the old one
          .then(()=> {
            if(oldImage !== data.image_name) {
              return cloudinary.uploader.destroy(oldImage, {public_id: oldImage}, function(error, result){
                   console.log(result, error);
               })
            } else return;
          })
          .catch(err => next(err))  

    } else{
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
    }

    
})
.delete(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin,(req, res, next)=>{

    data = JSON.parse(req.body.datas);
    const oldImage = data.image_name;
    
    //delete the program
    Carousels.findByIdAndRemove(req.params.carouselId)
    .then((resp)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    })
    //then delete the old one
    .then(()=> cloudinary.uploader.destroy(oldImage, {public_id: oldImage}, function(error, result){
        console.log(result, error);
    }))
    .catch((err)=>next(err));
})

module.exports = carouselRouter;