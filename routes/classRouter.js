const express = require('express');
const bodyParser =require('body-parser');
const cors = require('./cors');
const authenticate = require('../authenticate');
const Classes = require('../models/classes');

const Programs = require('../models/programs');

const classRouter = express.Router();

classRouter.use(bodyParser.json());

classRouter.route('/')
.options(cors.corsWithOptions, (req,res)=>{res.sendStatus(200)})
.get(cors.corsWithOptions, (req, res, next)=>{
    
    // for get many with query fileter on admin
    if(req.query.range === undefined ){
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
        
        Classes.find(req.query)
        .then(classes=>{
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');            
            res.json(classes)
        }).catch(err => next(err))
    } else {
        let searchQ = JSON.parse(req.query.filter);
        let rangeFilter = JSON.parse(req.query.range);
        let sortF = JSON.parse(req.query.sort);
        let {filter, range, sort , ...query} = req.query;
        req.query = query;   //update req.query.

        Classes.find(req.query)
        .then((classes)=>{
            if(searchQ.q){      //support for search
                let search = searchQ.q.toLowerCase();
                
                //first find each program by name and convert to program.id
                let chosenProgram ;
                Programs.find({})
                .then((programs)=>{
                    chosenProgram=(programs.find(program =>program.name.toLowerCase().includes(search)));
            
                }).then(()=>{
                    console.log("the length ")
                    let programId = 1111;
                    if(chosenProgram){
                        programId = JSON.stringify(chosenProgram._id);
                    }   
                    

                    let preMatched = classes;
                    if(searchQ.id) {
                        let searchId = searchQ.id.toLowerCase();  
                        preMatched = classes.filter(classs =>classs.id.toLowerCase().includes(searchId));
                    }
                    if(searchQ.id) {
                        let searchId = searchQ.id.toLowerCase();  
                        preMatched = classes.filter(clas =>clas.id.toLowerCase().includes(searchId));
                     }
                    if(searchQ.program){
                        let searchedPorgram = searchQ.program;    
                        preMatched = classes.filter(clas => clas.program == searchedPorgram);
                    }
                    if(searchQ.classStartDate){
                        let date = new Date(searchQ.classStartDate);
                        let month = date.getMonth()
                        let year = date.getFullYear();            
                        preMatched = classes.filter(clas => 
                            clas.classStartDate.getMonth() === month && clas.classStartDate.getFullYear() === year);
                    }
                    if(searchQ.classEndDate){
                        let date = new Date(searchQ.classEndDate);
                        let month = date.getMonth()
                        let year = date.getFullYear();            
                        preMatched = classes.filter(clas =>{
                            try{
                                if(clas.classEndDate.getMonth() === month && clas.classEndDate.getFullYear() === year){
                                    return true;
                                } else {
                                    return false;
                                }
                            } catch(err){
                                return false;        
                            }
                        } );
                            
                    }
                    const matched = preMatched.filter(classs =>JSON.stringify(classs.program) === programId);
                    //const matched = classes;
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.setHeader('Content-Range', `matched 0 - 10 /${matched.length}`);
                    res.setHeader('Access-Control-Expose-Headers', 'Content-Range');
                    matched.sort((p1,p2)=>{
                        if(sortF[1] === "ASC") return p1[sortF[0]].localeCompare(p2[sortF[0]]);
                                            else return p2[sortF[0]].localeCompare(p1[sortF[0]]); });
                    res.json(matched.slice(rangeFilter[0],rangeFilter[1]));
                    })
                    .catch(err => console.log(err));
                                
            }else{
                console.log(classes.length);            
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');            
                res.setHeader('Content-Range',  `classes 0 - 10 / ${classes.length}`);
                res.setHeader('Access-Control-Expose-Headers', 'Content-Range');
                classes.sort((p1,p2)=>{
                    if(sortF[1] === "ASC") return p1[sortF[0]].localeCompare(p2[sortF[0]]);
                                        else return p2[sortF[0]].localeCompare(p1[sortF[0]]); });
                res.json(classes.slice(rangeFilter[0],rangeFilter[1]));
            }        
        }).catch((err)=> next(err));
        
      }
})
.post(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin,(req, res, next)=>{
    //remove duplicate sutdent ids
    console.log(req.body)
    let mySet = new Set()
    req.body['students'].forEach(s => mySet.add(s.student))
    let uniqueStudents = []
    mySet.forEach(e => {
        let tempObj = {}
        tempObj['student'] = e
        uniqueStudents.push(tempObj)
    })
    req.body['students'] = uniqueStudents
    console.log(req.body)
    Classes.create(req.body)
    .then((classs)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(classs)
    })
    .catch((err)=> next(err));
    
})
.put(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin,(req, res, next)=>{
    res.statusCode = 403;
    res.end("PUT operation not supported on /classes");
})
.delete(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin,(req, res, next)=>{
    let arrayId =  JSON.parse(req.query.filter).id;
     for(let id of arrayId){
        Classes.findByIdAndRemove(id)
        .then(res=>{
            console.log(" ");
        })
        .catch(err => console.log(err));
    }
    
    Classes.find({})
    .then((classs)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(classs);
    })
    .catch((err)=> next(err));
});

//with id
classRouter.route('/:classId')
.options(cors.corsWithOptions, (req,res)=>{res.sendStatus(200)})
.get(cors.cors,(req, res, next)=>{
    Classes.findById(req.params.classId)
    .then((classs)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(classs);
    })
    .catch((err)=> next(err));
})
.post(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin,(req,res, next)=>{
    res.statusCode = 403;
    res.end('POST operation not supported on /classes/' + req.params.classId);
})
.put(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin,(req, res, next)=>{
    console.log(req.body)
    Classes.findByIdAndUpdate(req.params.classId, {
        $set: req.body
    }, {new: true})
    .then((classs)=>{
        Classes.findById(classs.id)
        .then((classs)=>{
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(classs);
        },(err)=> next(err))
    })
    .catch((err)=> next(err));
   
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin,(req, res, next) =>{
    Classes.findByIdAndRemove(req.params.classId)
    .then((resp)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    })
    .catch((err)=>next(err));
})

module.exports = classRouter;
