const express = require('express');
const cors = require('cors');
const app = express();

const whitelist =['https://abyssinia-computer-engineering.netlify.app'];

var corsOptionsDelegate = (req, callback) => {
    var corsOptions;
    if(whitelist.indexOf(req.header('Origin')) !== -1) {
        corsOptions = {origin: true}; // allow it
    } else {
        corsOptions = {origin: false};
    }

    callback(null, corsOptions);
};

exports.cors = cors();
exports.corsWithOptions = cors(corsOptionsDelegate); //previous one