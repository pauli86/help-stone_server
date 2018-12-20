const express = require('express');
//const sess = require('express-session');

const app = express();

// const sessTestWeb = express();
// const sessTestAPI = express();

const bodyParser = require('body-parser');

let port = 3000;

app.use(bodyParser.json({limit:'50mb'}));
app.use(bodyParser.urlencoded({limit:'50mb',extended:true,parameterLimit:50000}));

app.all('/*',function(req,res,next){
    const apiName ='['+(Date().toLocaleString()).split(' GMT')[0]+'][ API SERVER ]';
    console.log(apiName);
    res.header('Access-Control-Allow-Origin','*');
    res.header('Access-Control-Allow-Method','POST');
    res.header('Access-Control-Allow-Headers','X-Requested-With,Content-Type');
    res.header('Access-Control-Allow-Origin', 'http://open8.vps.phps.kr:4501');
    res.header('Access-Control-Allow-Credentials','true');
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


// sessTestAPI.all('/*',function(req,res,next){
//     const apiName ='\n\n['+(Date().toLocaleString()).split(' GMT')[0]+'][ API SERVER ]';
//     console.log(apiName);
//     //res.header('Access-Control-Allow-Origin','*');
//     res.header('Access-Control-Allow-Method','GET,POST');
//     res.header('Access-Control-Allow-Headers','X-Requested-With,Content-Type');
//     res.header('Access-Control-Allow-Origin', 'http://open8.vps.phps.kr:4501');
//     res.header('Access-Control-Allow-Credentials','true');
//     res.header('Cache-Control','private, no-cache, no-store, must-revalidate');
//     next();
// })

// sessTestAPI.use(bodyParser.urlencoded({ extended: false }))

// // parse sessTestAPIlication/json
// sessTestAPI.use(bodyParser.json())

// // session
// sessTestAPI.use(sess({
//         secret: 'ABROSS_SESSION_SECRET_KEY',
//         resave: false,
//         saveUninitialized: true,
//         cookie: { maxAge: 60000 }
// }));


// sessTestAPI.get('/',function(req,res){
// 	console.log('요청 경로 /');
//         var sessionVal = req.session;
//         sessionVal.name = 'session test name';
// 	console.log('세션 아이디 부여');
//         console.log('sValue = ',sessionVal);
// 	console.log('sID = ',req.sessionID);
//         res.json({result:1,id:req.sessionID,name:sessionVal.name ,sessionVal: sessionVal,from:'node TEST SERVER /'});
//         res.end();
// });

// sessTestAPI.get('/test',function(req,res){
// 	console.log('요청 경로 /test');
// 	console.log('세션 아이디 확인');
// 	console.log('sValue = ',req.session);
// 	console.log('sID = ',req.sessionID);
// 	res.json({result:1,id:req.sessionID,data:req.session});
// 	res.end()
// });

// sessTestAPI.listen(4500,function(){
//         console.log('test Server running on 4500 port');
// });

// const path = require('path');


// sessTestWeb.all('/*',function(req,res,next){
//     const apiName ='['+(Date().toLocaleString()).split(' GMT')[0]+'][ API SERVER ]';
//     console.log(apiName);
//     res.header('Access-Control-Allow-Origin','*');
//     res.header('Access-Control-Allow-Method','POST');
//     res.header('Access-Control-Allow-Headers','X-Requested-With,Content-Type');
//     res.header('Access-Control-Allow-Origin', 'http://open8.vps.phps.kr:4501');
//     res.header('Access-Control-Allow-Credentials','true');
//     res.header('Cache-Control','private, no-cache, no-store, must-revalidate');
//     next();
// })

// sessTestWeb.use(express.static(path.join(__dirname,'build')));
// sessTestWeb.get('/',function(req,res){
// 	res.sendFile(path.join(__dirname,'build','index.html'));
// });

// sessTestWeb.listen(4501);
