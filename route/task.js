const express = require('express');
const app = express.Router();
const mongoose = require('mongoose');


const User = require('../models/user');
const Project = require('../models/project');
const Task = require('../models/task');
const Do = require('../models/todo');
const Log = require('../models/log');



app.post('/add',function(req,res){
    const apiName ='['+(Date().toLocaleString()).split(' GMT')[0]+'][ TASK ][ ADD ] ';
    console.log(apiName);
    let errMsg = '';
    let title = req.body.title?req.body.title:false;
    let desc = req.body.desc?req.body.desc:false;
    let uid = req.body.uid?req.body.uid:false;
    let pid = req.body.pid?req.body.pid:false;
    let mystate = '추가';

    if(!(title&&desc&&uid&&pid)){
        console.log(apiName+'parameter check error');
        return res.json({result:3,msg:'모든 항목을 입력하세요.'});
    }
    Project.findOneAndUpdate({
        _id:mongoose.Types.ObjectId(pid)
    },{
        $set:{lastUpdate:new Date()}
    })
    .then(project=>{
        if(!project){
            console.log(apiName+'project find error');
            errMsg ='프로젝트를 찾을 수 없습니다';
            throw new Error();
        }
        let task = new Task();
        task.title = title;
        task.desc = desc;
        task.user = uid;
        task.project = pid;
        task.state = 'ongoing';
        task.save();
        project.taskList.push(task._id);
        
        User.findByIdAndUpdate({_id:mongoose.Types.ObjectId(uid)},{$push:{taskList:task}},function(err,user){
            if(err)console.log(apiName+' user tasklist add error');
            else console.log(apiName+'task listed in user taskList');
        });
        
        let log = new Log();
        log.project = project._id;
        log.user = uid;
        log.task = task._id;
        log.sector = 'task';
        log.title = task.title;
        log.action = mystate;
        log.date = new Date();
        log.save();        
        project.logList.push(log._id);        
        
        return project.save();
    })
    .then(project=>{
        if(!project){
            console.log(apiName+'project save error');
            throw new Error();
        }
        return Project.findOne({_id:pid})
        .populate({path:'manager',select:'name id email'})
        .populate({path:'team',select:'name id email'})
        .populate({path:'taskList',model:'task'})
        .populate({path:'logList',model:'log'})
    })    
    .then(project=>{
        if(!project){
            console.log(apiName+'project populate error');
            throw new Error();
        }
        console.log(apiName+' add task complete');
        return res.json({result:1,msg:'태스크 생성 완료',data:project});
    })
    .catch(e=>{
        console.log(e);
        let msg = errMsg!==''?errMsg:'서버에러';
        return res.json({result:2,msg:msg});
    });
});

app.post('/view',function(req,res){
    const apiName ='['+(Date().toLocaleString()).split(' GMT')[0]+'][ TASK ][ VIEW ] ';
    console.log(apiName);
    let errMsg = '';    
    let uid = req.body.uid?req.body.uid:false;
    let pid = req.body.pid?req.body.pid:false;
    if(!(uid&&pid)){
        console.log(apiName+'parameter check error');
        return res.json({result:3,msg:'모든 항목을 입력하세요.'});
    }
    Task.find({project:mongoose.Types.ObjectId(pid),user:mongoose.Types.ObjectId(uid)})
    .populate({path:'doList',model:'do'})
    .then(tasks=>{
        if(!tasks){
            console.log(apiName+'task populate error');
            throw new Error();
        }
        console.log(apiName+' tasks found');
        return res.json({result:1,msg:'태스크정보 조회 완료',data:tasks});
    })
    .catch(e=>{
        console.log(e);
        let msg = errMsg!==''?errMsg:'서버에러';
        return res.json({result:2,msg:msg});
    });
});

app.post('/update',function(req,res){
    const apiName ='['+(Date().toLocaleString()).split(' GMT')[0]+'][ TASK ][ UPDATE ] ';
    console.log(apiName);
    let errMsg = '';    
    let uid = req.body.uid?req.body.uid:false;
    let tid = req.body.tid?req.body.tid:false;
    let title = req.body.title?req.body.title:false;
    let desc = req.body.desc?req.body.desc:false;
    let state = req.body.state?req.body.state:false;
    let updateQuery = {}    
    let mystate = '수정';
    if(title){
        Object.assign(updateQuery,{title:title});    
    }
    if(desc){
        Object.assign(updateQuery,{desc:desc});
    }
    if(state){
        if(state === 'done'){
            let doneDate = new Date();
            mystate = '완료';
            Object.assign(updateQuery,{state:state,doneDate:doneDate});
        }else{
            Object.assign(updateQuery,{state:state});
        }       
    }
    if(!((uid&&tid)&&(title||desc||state))){
        console.log(apiName+'parameter check error');
        return res.json({result:3,msg:'모든 항목을 입력하세요.'});
    }
    Task.findOneAndUpdate({_id:mongoose.Types.ObjectId(tid),user:mongoose.Types.ObjectId(uid)},
        {$set:updateQuery},{new:false}).populate({path:'doList',model:'do'})
    .then(task=>{
        if(!task){
            console.log(apiName+' task find and update error');            
            throw new Error();
        }
        let content = '';
        let updateFlag = Object.keys(updateQuery)[0];
        switch(updateFlag){
            case 'state':
            content = '상태 : '+ task.state + ' -> ' +state;
            task.state = state;            
            break;
            case 'title':
            content = '태스크명 : '+ task.title + ' -> ' +title;
            task.title = title;
            break;
            case 'desc':
            content = '설명 : '+ task.desc + ' -> ' +desc;
            task.desc = desc;
            break;
        }        
        
        let log = new Log();
        log.project = task.project;
        log.task = task._id;
        log.sector = 'task';
        log.user = uid;
        log.title = content;
        log.action = mystate;
        log.date = new Date();
        log.save();        
        Project.findOneAndUpdate({
            _id:mongoose.Types.ObjectId(task.project)
        },{
            $set:{lastUpdate:new Date()},
            $push:{logList:log._id}
        },function(err,ret){
            if(err)return res.json({result:2,msg:'태스크 업데이트 실패',data:task});
            return res.json({result:1,msg:'태스크 업데이트 완료',data:task});
        });
        
    })
    .catch(e=>{
        console.log(e);
        let msg = errMsg!==''?errMsg:'서버에러';
        return res.json({result:2,msg:msg});
    });
});

app.post('/delete',function(req,res){
    const apiName ='['+(Date().toLocaleString()).split(' GMT')[0]+'][ TASK ][ DELETE ] ';
    console.log(apiName);
    let errMsg = '';    
    let mystate = '삭제';
    let uid = req.body.uid?req.body.uid:false;
    let tid = req.body.tid?req.body.tid:false;
    if(!(uid&&tid)){
        console.log(apiName+'parameter check error');
        return res.json({result:3,msg:'모든 항목을 입력하세요.'});
    }
    Task.findOneAndRemove({_id:mongoose.Types.ObjectId(tid),user:mongoose.Types.ObjectId(uid)})
    .then(task=>{        
        if(!task){
            console.log(apiName+' task delete error');            
            throw new Error();
        }
        let log = new Log();
        log.project = task.project;
        log.task = task._id;
        log.sector = 'task';
        log.user = uid;
        log.title = task.title;
        log.action = mystate;
        log.date = new Date();
        log.save();        
        Project.findOneAndUpdate({
            _id:mongoose.Types.ObjectId(task.project)
        },{
            $set:{lastUpdate:new Date()},
            $push:{logList:log._id}
        });
        // if(!result.n){
        //     console.log(apiName+'not found',result);
        //     return res.json({result:1,msg:'존재하지 않는 태스크'});    
        // }
        console.log(apiName+'task delete complete',result);
        return res.json({result:1,msg:'태스크 삭제 완료'});
    })
    .catch(e=>{
        console.log(e);
        let msg = errMsg!==''?errMsg:'서버에러';
        return res.json({result:2,msg:msg});
    });
});


module.exports = app;