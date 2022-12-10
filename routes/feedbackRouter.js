const express = require('express');
const bodyParser =require('body-parser');
const cors = require('./cors');

const Feedbacks = require('../models/feedbacks');

const feedbackRouter = express.Router();

feedbackRouter.use(bodyParser.json());

feedbackRouter.route('/')
.options(cors.corsWithOptions, (req,res)=>{res.sendStatus(200)})
.get(cors.corsWithOptions, (req, res, next)=>{
    
    //get many in admin
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
        Feedbacks.find(req.query)
        .then((feedbacks)=>{
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');            
            res.json(feedbacks)
        }).catch(err => next(err))
    } else {
        let searchQ = JSON.parse(req.query.filter);
        let rangeFilter = JSON.parse(req.query.range);
        let sortF = JSON.parse(req.query.sort);
        let {filter, range, sort , ...query} = req.query;
        req.query = query;   //update req.query.

        Feedbacks.find(req.query)
        .then((feedbacks)=>{
            if(searchQ.q){      //support for search
                let search = searchQ.q.toLowerCase();
                let preMatched = feedbacks;
                if(searchQ.id) {
                    let searchId = searchQ.id.toLowerCase();  
                    preMatched = feedbacks.filter(feedback =>feedback.id.toLowerCase().includes(searchId));
                 }
                const matched = preMatched.filter(feedback =>feedback.name.toLowerCase().includes(search));
                 
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Content-Range', `matched 0 - 10 /${matched.length}`);
                res.setHeader('Access-Control-Expose-Headers', 'Content-Range');
                matched.sort((p1,p2)=>{
                    if(sortF[1] === "ASC") return p1[sortF[0]].localeCompare(p2[sortF[0]]);
                                        else return p2[sortF[0]].localeCompare(p1[sortF[0]]); });
                res.json(matched.slice(rangeFilter[0],rangeFilter[1]));
            }else{
                console.log(feedbacks.length);            
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');            
                res.setHeader('Content-Range',  `feedbacks 0 - 10 / ${feedbacks.length}`);
                res.setHeader('Access-Control-Expose-Headers', 'Content-Range');
                feedbacks.sort((p1,p2)=>{
                    if(sortF[1] === "ASC") return p1[sortF[0]].localeCompare(p2[sortF[0]]);
                                        else return p2[sortF[0]].localeCompare(p1[sortF[0]]); });
                res.json(feedbacks.slice(rangeFilter[0],rangeFilter[1]));
            }        
        }).catch((err)=> next(err));
        
      }
})
.post(cors.corsWithOptions,(req, res, next)=>{
    Feedbacks.create(req.body)
    .then((feedback)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(feedback)
    })
    .catch((err)=> next(err));
})
.put(cors.corsWithOptions,(req, res, next)=>{
    res.statusCode = 403;
    res.end("PUT operation not supported on /feedbacks");
})
.delete(cors.corsWithOptions,(req, res, next)=>{
    let arrayId =  JSON.parse(req.query.filter).id;
     for(let id of arrayId){
        Feedbacks.findByIdAndRemove(id)
        .then(res=>{
            console.log(" ");
        })
        .catch(err => console.log(err));
    }
    
    Feedbacks.find({})
    .then((feedback)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(feedback);
    })
    .catch((err)=> next(err));
});

//with id
feedbackRouter.route('/:feedbackId')
.options(cors.corsWithOptions, (req,res)=>{res.sendStatus(200)})
.get(cors.cors,(req, res, next)=>{
    Feedbacks.findById(req.params.feedbackId)
    .then((feedback)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(feedback);
    })
    .catch((err)=> next(err));
})
.post(cors.corsWithOptions,(req,res, next)=>{
    res.statusCode = 403;
    res.end('POST operation not supported on /feedbacks/' + req.params.feedbackId);
})
.put(cors.corsWithOptions,(req, res, next)=>{
    Feedbacks.findByIdAndUpdate(req.params.feedbackId, {
        $set: req.body
    }, {new: true})
    .then((feedback)=>{
        Feedbacks.findById(feedback.id)
        .then((feedback)=>{
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(feedback);
        },(err)=> next(err))
    })
    .catch((err)=> next(err));
})
.delete(cors.corsWithOptions, (req, res, next) =>{
    Feedbacks.findByIdAndRemove(req.params.feedbackId)
    .then((resp)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    })
    .catch((err)=>next(err));
})

module.exports = feedbackRouter;
