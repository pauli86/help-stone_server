const express = require('express');
const app = express();
const bodyParser = require('body-parser');

let port = 3000;

app.use(bodyParser.json({limit:'50mb'}));
app.use(bodyParser.urlencoded({limit:'50mb',extended:true,parameterLimit:50000}));

app.all('/*',function(req,res,next){
    //const apiName ='['+(Date().toLocaleString()).split(' GMT')[0]+'][ API SERVER ]';
    //console.log(apiName);
    res.header('Access-Control-Allow-Origin','*');
    res.header('Access-Control-Allow-Method','POST');
    res.header('Access-Control-Allow-Headers','X-Requested-With,Content-Type');
    res.header('Cache-Control','private, no-cache, no-store, must-revalidate');
    next();
    
})

app.use('/api/user',require('./route/user'));
app.use('/api/project',require('./route/project'));
app.use('/api/task',require('./route/task'));
app.use('/api/todo',require('./route/todo'));
app.use('/api/log',require('./route/log'));

app.all('/*',function(req,res){
    res.status(404);
    res.end();
});

app.listen(port,function(){
    console.log('listen on '+port);
});