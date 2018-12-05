const express = require('express');
const app = express.Router();
const mongoose = require('mongoose');

// 추가가 되면 user, task 에 추가가 되고, 로그가 저장되며 해당 로그는 프로젝트에 저장된다.

const User = require('../models/user');
const Project = require('../models/project');
const Task = require('../models/task');
const Do = require('../models/todo');
const Log = require('../models/log');

app.post('/add',function(req,res){
    const apiName ='['+(Date().toLocaleString()).split(' GMT')[0]+'][ DO ][ ADD ] ';
    console.log(apiName);
    let errMsg = '';    
    let uid = req.body.uid?req.body.uid:false;
    let tid = req.body.tid?req.body.tid:false;
    let title = req.body.title?req.body.title:false;
    if(!(uid&&tid&&title)){
        console.log(apiName+'parameter check error');
        return res.json({result:3,msg:'모든 항목을 입력하세요.'});
    }
    let todo = new Do();
    todo.user = uid;
    todo.title = title;
    todo.state = 'yet';
    todo.save();
    
    let log = new Log();
    log.do = todo._id;
    log.sector = 'do';
    log.title = title;
    log.action = 'create';
    log.date = new Date();
    

    Task.findOneAndUpdate({
        _id:mongoose.Types.ObjectId(tid)
    },{
        $push:{doList:todo}
    })
    .then(task=>{
        if(!task){
            console.log(apiName+' task find and update error');            
            throw new Error();
        }
        log.project = task.project;
        log.task = task._id;
        log.user = task.user;
        
        User.findOneAndUpdate({
            _id:mongoose.Types.ObjectId(task.user)
        },{
            $push:{doList:todo}
        },function(err){
            if(err)console.log(apiName+'user do list find and update error');
        });
        log.save();
        Project.findOneAndUpdate({
            _id:mongoose.Types.ObjectId(task.project)
        },{
            $push:{logList:log._id}
        },function(err){
            if(err)console.log(apiName+'project log find and update error');
        });
    })    
    .catch(e=>{
        console.log(e);
        let msg = errMsg!==''?errMsg:'서버에러';
        return res.json({result:2,msg:msg});
    })
})

app.post('/update',function(req,res){

})

app.post('/delete',function(req,res){

})
module.exports = app;