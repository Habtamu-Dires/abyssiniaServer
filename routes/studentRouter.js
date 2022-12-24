const express = require('express');
const bodyParser =require('body-parser');
const cors = require('./cors');
const authenticate = require('../authenticate');
const Students = require('../models/students');

const studentRouter = express.Router();

studentRouter.use(bodyParser.json());

studentRouter.route('/')
.options(cors.corsWithOptions, (req,res)=>{res.sendStatus(200)})
.get(cors.corsWithOptions, (req, res, next)=>{
    
    //to filter with request.filter from admin with id chnaged to _id
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
        
        Students.find(req.query)
        .then(students=>{
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');            
            res.json(students)
        }).catch(err => next(err))
    } else {
        let searchQ = JSON.parse(req.query.filter);
        let rangeFilter = JSON.parse(req.query.range);
        let sortF = JSON.parse(req.query.sort);
        let {filter, range, sort , ...query} = req.query;
        req.query = query;   //update req.query.

        Students.find(req.query)
        .then((students)=>{
            if(searchQ.q){      //support for search
                let search = searchQ.q.toLowerCase();
                let preMatched = students;
                if(searchQ.id) {
                    let searchId = searchQ.id.toLowerCase();  
                    preMatched = students.filter(student =>student.id.toLowerCase().includes(searchId));
                 }
                const matched = preMatched.filter(student =>student.name.toLowerCase().includes(search));
                 
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Content-Range', `matched 0 - 10 /${matched.length}`);
                res.setHeader('Access-Control-Expose-Headers', 'Content-Range');
                matched.sort((p1,p2)=>{
                    if(sortF[1] === "ASC") return p1[sortF[0]].localeCompare(p2[sortF[0]]);
                                        else return p2[sortF[0]].localeCompare(p1[sortF[0]]); });
                res.json(matched.slice(rangeFilter[0],rangeFilter[1]));
            }else{
                console.log(students.length);            
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');            
                res.setHeader('Content-Range',  `students 0 - 10 / ${students.length}`);
                res.setHeader('Access-Control-Expose-Headers', 'Content-Range');
                students.sort((p1,p2)=>{
                    if(sortF[1] === "ASC") return p1[sortF[0]].localeCompare(p2[sortF[0]]);
                                        else return p2[sortF[0]].localeCompare(p1[sortF[0]]); });
                res.json(students.slice(rangeFilter[0],rangeFilter[1]));
            }        
        }).catch((err)=> next(err));
        
      }
})
.post(cors.corsWithOptions, (req, res, next)=>{
    
    Students.create(req.body)
    .then((student)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(student)
    })
    .catch((err)=> next(err));
    
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin,(req, res, next)=>{
    res.statusCode = 403;
    res.end("PUT operation not supported on /students");
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin,(req, res, next)=>{
    let arrayId =  JSON.parse(req.query.filter).id;
    console.log("here")
    console.log(arrayId)
     for(let id of arrayId){
        Students.findByIdAndRemove(id)
        .then(res=>{
            console.log(" ");
        })
        .catch(err => console.log(err));
    }
    
    Students.find({})
    .then((student)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(student);
    })
    .catch((err)=> next(err));
});

//with id
studentRouter.route('/:studentId')
.options(cors.corsWithOptions, (req,res)=>{res.sendStatus(200)})
.get(cors.cors,(req, res, next)=>{
    Students.findById(req.params.studentId)
    .then((student)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(student);
    })
    .catch((err)=> next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin,(req,res, next)=>{
    res.statusCode = 403;
    res.end('POST operation not supported on /students/' + req.params.studentId);
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin,(req, res, next)=>{
    console.log(req.body)
    Students.findByIdAndUpdate(req.params.studentId, {
        $set: req.body
    }, {new: true})
    .then((student)=>{
        Students.findById(student.id)
        .then((student)=>{
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(student);
        },(err)=> next(err))
    })
    .catch((err)=> next(err));
   
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin,(req, res, next) =>{
    Students.findByIdAndRemove(req.params.studentId)
    .then((resp)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    })
    .catch((err)=>next(err));
})

module.exports = studentRouter;
