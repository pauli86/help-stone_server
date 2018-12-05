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
        todo.project = task.project;
        todo.save();

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
        console.log(apiName+'project log find and update error')
        return res.json({result:1,msg:'할일 생성 완료',data:todo});
    })    
    .catch(e=>{
        console.log(e);
        let msg = errMsg!==''?errMsg:'서버에러';
        return res.json({result:2,msg:msg});
    })
})

app.post('/update',function(req,res){ // 프로젝트에 로그, state->done일경우 done date
    const apiName ='['+(Date().toLocaleString()).split(' GMT')[0]+'][ DO ][ UPDATE ] ';
    console.log(apiName);
    let errMsg = '';    
    let did = req.body.did?req.body.did:false;    
    let title = req.body.title?req.body.title:false;
    let state = req.body.state?req.body.state:false;

    
    if(!(did&&(state||title))){
        console.log(apiName+'parameter check error');
        return res.json({result:3,msg:'모든 항목을 입력하세요.'});
    }

    let ret ={};
    let flag ='';
    let query = {};
    let content = '';
    if(title){
        Object.assign(query,{title:title})
        flag = 'title';
    }
    if(state){
        if(state==='done') Object.assign(query,{doneDate:new Date()});
        Object.assign(query,{state:state});
        flag = 'state';
    }
    Do.findOneAndUpdate({
        _id:mongoose.Types.ObjectId(did)
    },{
        $set:query
    })
    .then(todo=>{
        
        switch(flag){
            case 'title':
                content = todo.title + ' -> ' + title;
                break;
            case 'state':
                content = todo.state + ' -> ' + state;
                break;
        }
        let log = new Log();
        log.do = todo._id;
        log.project = todo.project;
        log.user = todo.user;
        log.sector = 'do';
        log.title = content;
        log.action = 'update';
        log.date = new Date();
        log.save();
        ret.prev = todo;
        ret.query = query;
        ret.log = log;
        return Project.updateOne({
            _id:mongoose.Types.ObjectId(todo.project)
        },{
            $push:{logList:log._id}
        })
    })
    .then(result=>{
        console.log(apiName + 'result :',result);
        if(!result){
            console.log(apiName+' todo update error');            
            throw new Error();
        }
        console.log(apiName+' todo update complete');
        return res.json({result:1,msg:'할일 업데이트 완료',data:ret});
    })
    .catch((e)=>{        
        let msg = errMsg!==''?errMsg:'서버에러';
        console.log(apiName+'todo error catch',e);
        return res.json({result:2,msg:msg});
    });
    
})

app.post('/delete',function(req,res){ // Do collection 에서 지우고 로그 남기기
    const apiName = '['+(Date().toLocaleString()).split(' GMT')[0]+'][ DO ][ DELETE ] ';
    console.log(apiName);
    let did = req.body.did?req.body.did:false;
    

    if(!(did)){
        console.log(apiName+'project find error');
        errMsg ='프로젝트를 찾을 수 없습니다';
        throw new Error();
    }

    
    Do.findOneAndRemove({
        _id:mongoose.Types.ObjectId(did)
    })
    .then(todo=>{
        let log = new Log();
        log.do = todo._id;
        log.project = todo.project;
        log.user = todo.user;
        log.sector = 'do';
        log.title = todo.title;
        log.action = 'delete';
        log.date = new Date();
        log.save();
        return Project.updateOne({
            _id:mongoose.Types.ObjectId(todo.project)
        },{
            $push:{logList:log._id}
        })

    })
    .then(result=>{
        console.log(apiName + 'result :',result);
        if(!result){
            console.log(apiName+' todo delete error');            
            throw new Error();
        }
        console.log(apiName+' todo delete complete');
        return res.json({result:1,msg:'할일 삭제 완료',data:result});
    })
    .catch((e)=>{        
        let msg = errMsg!==''?errMsg:'서버에러';
        console.log(apiName+'todo error catch',e);
        return res.json({result:2,msg:msg});
    });


})
module.exports = app;