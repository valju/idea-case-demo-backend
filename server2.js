﻿
// Most service handling code taken from Tudor Nica's task submission,
// with possible minor edits.

// SETUP the required modules, settings and headers

var express = require('express');
var app = express();
// var fs = require("fs");
var bodyParser = require('body-parser');
var jsonfile = require('jsonfile');

const filePath = __dirname + "/" + "categories.json";

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(function (req, res, next) {
    "use strict";
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


// WEB SERVICE ENDPOINTS (=our REST API services)

// hello
app.get('/hello', function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end("Hello World from Node.js Back-end");
});

// GET category/all
app.get('/category/all', function (req, res) {
    jsonfile.readFile(filePath)
    .then((obj) => {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(JSON.stringify(obj));
        console.log("Reading server side JSON file OK.\n" + JSON.stringify(obj));
    })
    .catch(() => {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end();
        console.error("Reading server side JSON file failed.");
        }
    );
});

// GET category based on ID
app.get('/category', function (req, res) {
    let id = req.query.id;
    fetchItemBasedOnIdAndSendToFrontend(res, id);
});

// POST category (id, name, budget)
app.post('/category', function (req, res) {
    let id = req.body.id;
    let name = req.body.name;
    let budget = req.body.budget;
    let newItem = { id, name, budget };
    addItemToJsonArrayFile(res, newItem);
})

// DELETE category?id=1001
app.delete('/category', function (req, res) {
    let id = req.query.id;
    deleteItemBasedOnId(res, id);
})


// HELPER FUNCTIONS

function fetchItemBasedOnIdAndSendToFrontend (res, id) {
    let item=null;
    jsonfile.readFile(filePath)
    .then((obj) => {
        for (let i=0; i < obj.length; i++) {
            if (obj[i].id === Number(id)) {
                //item = obj.splice(i, 1);
                item = obj[i];  // We don't need the obj anymore, so let's just refer to it's item
            }
        };
        if (item) {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end(JSON.stringify(item));
            console.log("Reading server side JSON file OK.\n" + "Item found: " + JSON.stringify(item));
        } else {
            // Atm. also no id given goes here. More error-handling needed?
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end();
            console.log("Reading server side JSON file OK.\n" + "No item found with ID = " + id + ".");
        };
    })
    .catch(() => {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            console.error("Reading server side JSON file failed.");
        }
    );
};

function deleteItemBasedOnId (res, id) {
    let item;
    jsonfile.readFile(filePath)
    .then((obj) => {
        for (let i=0; i < obj.length; i++) {
            if (obj[i].id == id) {
                item = obj.splice(i, 1);  // Now we really want to do the splice, as obj array written back
            }
        };
        if (item) {
            jsonfile.writeFile(filePath, obj)
            .then(() => {
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end("Writing JSON to server file system OK.\n" + "Item deleted: " + JSON.stringify(item));
            })
            .catch(() => {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end("Writing JSON to server file system failed.");
            });
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end("Reading server side JSON file OK.\n" + "No item found with ID = " + id + ".");
        };
    })
    .catch(() => {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end("Reading server side JSON file failed.");
        }
    );
}

function addItemToJsonArrayFile (res, newItem) {
    jsonfile.readFile(filePath)
    .then((obj) => {
        obj.push(newItem);
        jsonfile.writeFile(filePath, obj)
        .then(() => {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end("Writing JSON to server file system OK.");
        })
        .catch(() => {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end("Writing JSON to server file system failed.");
        });
    })
    .catch(() => {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end("Reading server side JSON file failed.");
        }
    );
};

// This was left here as an example of the version where the
// readFile and writeFile promise returning chain was combined.
// Good: All goes to same chain. 
// Bad: The catch doesn't know whether exception happened in read or write
// T4 T4 T4 T4 T4 T4 T4 T4 T4 = T3 chained in one chain
app.get("/test4", 
    function (req,res) {
        jsonfile.readFile(filePath)
        .then(obj => {
                obj.push(
                    {          
                        name: "Addison Same-chain Wesley",           
                        points: 4444        
                    }
                );
                return obj;
            }
        )
        .then(obj => 
            jsonfile.writeFile(filePath,obj)
        )
        .then(() => {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end("Writing JSON to server file system OK.");
        })
        .catch(()=>{
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end("Reading or Writing server side JSON file failed.");
        })
    }
);


// START SERVER

var server = app.listen(3001, function () {
    "use strict";
    var host = server.address().address;
    var port = server.address().port;

    console.log("Example app listening at http://%s:%s", host, port);
});