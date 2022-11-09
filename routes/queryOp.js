const express = require('express');
const app = express();

const Programs = require('../models/programs');

exports.search =(req, res, next) =>{
    let f = JSON.parse(req.query.filter);

    console.log("query from the function");
    if(f.q){
        let search = f.q.toLowerCase();
        console.log(search);
        Programs.find({})  //{} all or query
        .then((programs)=>{
            const matched = programs.filter(program =>program.name.toLowerCase().includes(search));
            console.log(matched);
            res.json(matched);
            return next()
    })
    .catch((err)=> next(err));
        return next();
    } else{
        console.log("No query param");
        return next();
    }

}
