const express = require('express');
const app = express.Router();

const Project = require('../models/project');

app.post('/viewAll',function(req,res){
    const apiName ='['+(Date().toLocaleString()).split(' GMT')[0]+'][ PROJECT ][ VIEWALL ] ';
    console.log(apiName);
    let pids = req.body.pids?req.body.pids:false;

    if(!pids){
        console.log(apiName+'parameter check error');
        return res.json({result:3,msg:'서버 에러'});
    }
    Project.find({pid:{$in:pids}},function(err,res){
        if(err){
            console.log(apiName+'DB find error');
            return res.json({result:3,msg:'서버 에러'});
        }
        console.log(apiName+'find projects');
        return res.json({result:1,msg:'프로젝트를 찾았습니다.',data:res});
    });
});

module.exports = app;