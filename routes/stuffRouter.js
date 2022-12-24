const express = require('express');
const bodyParser =require('body-parser');
const cors = require('./cors');
const authenticate = require('../authenticate');
const Stuffs = require('../models/stuff');

const stuffRouter = express.Router();

stuffRouter.use(bodyParser.json());

stuffRouter.route('/')
.options(cors.corsWithOptions, (req,res)=>{res.sendStatus(200)})
.get(cors.corsWithOptions, (req, res, next)=>{
    
    //to filter with id but match with _id
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
        Stuffs.find(req.query)
        .then(stuffs=>{
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');            
            res.json(stuffs)
        }).catch(err => next(err))
    } else {
        let searchQ = JSON.parse(req.query.filter);
        let rangeFilter = JSON.parse(req.query.range);
        let sortF = JSON.parse(req.query.sort);
        let {filter, range, sort , ...query} = req.query;
        req.query = query;   //update req.query.

        Stuffs.find(req.query)
        .then((stuffs)=>{
            if(searchQ.q){      //support for search
                let search = searchQ.q.toLowerCase();
                let preMatched = stuffs;
                if(searchQ.id) {
                    let searchId = searchQ.id.toLowerCase();  
                    preMatched = stuffs.filter(stuff =>stuff.id.toLowerCase().includes(searchId));
                 }
                const matched = preMatched.filter(stuff =>stuff.name.toLowerCase().includes(search));
                 
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Content-Range', `matched 0 - 10 /${matched.length}`);
                res.setHeader('Access-Control-Expose-Headers', 'Content-Range');
                matched.sort((p1,p2)=>{
                    if(sortF[1] === "ASC") return p1[sortF[0]].localeCompare(p2[sortF[0]]);
                                        else return p2[sortF[0]].localeCompare(p1[sortF[0]]); });
                res.json(matched.slice(rangeFilter[0],rangeFilter[1]));
            }else{
                console.log(stuffs.length);            
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');            
                res.setHeader('Content-Range',  `stuffs 0 - 10 / ${stuffs.length}`);
                res.setHeader('Access-Control-Expose-Headers', 'Content-Range');
                stuffs.sort((p1,p2)=>{
                    if(sortF[1] === "ASC") return p1[sortF[0]].localeCompare(p2[sortF[0]]);
                                        else return p2[sortF[0]].localeCompare(p1[sortF[0]]); });
                res.json(stuffs.slice(rangeFilter[0],rangeFilter[1]));
            }        
        }).catch((err)=> next(err));
        
      }
})
.post(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin,(req, res, next)=>{
    
    Stuffs.create(req.body)
    .then((stuff)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(stuff)
    })
    .catch((err)=> next(err));
    
})
.put(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin,(req, res, next)=>{
    res.statusCode = 403;
    res.end("PUT operation not supported on /stuffs");
})
.delete(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin,(req, res, next)=>{
    let arrayId =  JSON.parse(req.query.filter).id;
     for(let id of arrayId){
        Stuffs.findByIdAndRemove(id)
        .then(res=>{
            console.log(" ");
        })
        .catch(err => console.log(err));
    }
    
    Stuffs.find({})
    .then((stuff)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(stuff);
    })
    .catch((err)=> next(err));
});

//with id
stuffRouter.route('/:stuffId')
.options(cors.corsWithOptions, (req,res)=>{res.sendStatus(200)})
.get(cors.cors,(req, res, next)=>{
    Stuffs.findById(req.params.stuffId)
    .then((stuff)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(stuff);
    })
    .catch((err)=> next(err));
})
.post(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin,(req,res, next)=>{
    res.statusCode = 403;
    res.end('POST operation not supported on /stuffs/' + req.params.stuffId);
})
.put(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin,(req, res, next)=>{
    console.log(req.body)
    Stuffs.findByIdAndUpdate(req.params.stuffId, {
        $set: req.body
    }, {new: true})
    .then((stuff)=>{
        Stuffs.findById(stuff.id)
        .then((stuff)=>{
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(stuff);
        },(err)=> next(err))
    })
    .catch((err)=> next(err));
   
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin,(req, res, next) =>{
    Stuffs.findByIdAndRemove(req.params.stuffId)
    .then((resp)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    })
    .catch((err)=>next(err));
})

module.exports = stuffRouter;
