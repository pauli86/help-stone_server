const express = require('express');
const mongoose = require('mongoose');
const app = express.Router();

const User = require('../models/user');
const Project = require('../models/project');
const Task = require('../models/task');

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

app.post('/test',function(req,res){
    /**
     * task ref cascade 삭제 및 수정 확인
     * test case 
     * 1. 프로젝트 생성
     * 2. 프로젝트에 태스크 2개 추가
     * 3. 태스크에서 1개 삭제시, 프로젝트 태스크리스트의 변경사항 확인
     * 
     */
    let project = new Project();
    project.title = 'test project';
    project.desc = 'test project for task list';
    project.save(function(err){
        if(err){
            return res.json({result:2,msg:'save error'});
        }
        User.findOne({uid:1},function(err2,user){
            if(err2){
                return res.json({result:2,msg:'user find err'});
            }
            user.projectList = [...user.projectList,project];
            user.save(function(err3){
                if(err3){
                    return res.json({result:2,msg:'user update err'});
                }
                return res.json({result:1,data:user});
            });            
        });        
    });    
})

app.post('/test2',function(req,res){
    let pid = req.body.pid;
    let task1 = new Task();
    task1.title = 'test task3';
    task1.save(function(err){
        let task2 = new Task();
        task2.title = 'test task4';
        task2.save(function(err){
            let taskList = [task1,task2];
            Project.findOneAndUpdate({pid:pid},{$set:{taskList:taskList}},{new:true},function(err,project){
                if(err){
                    return res.json({result:2,msg:'update error'});
                }
                return res.json({result:1,data:project});
            });
        });    
    });
    
    
    
    
});

app.post('/test3',function(req,res){
    let pid = req.body.pid;
    Project.findOne({pid:pid},function(err,project){
        if(err)return res.json({result:2,data:err});
        Task.find({_id:{$in:project.taskList.map(function(o){return mongoose.Types.ObjectId(o);})}},function(err2,tasks){
            if(err2)return res.json({result:2,data:err2});
            return res.json({result:1,data:tasks});
        });        
    });
});
app.post('/test4',function(req,res){
    let tid = req.body.tid;
    Task.findOneAndRemove({tid:tid},function(err,ret){
        if(err){
            return res.json({result:2,msg:'update error'});
        }
        return res.json({result:1,data:ret});
    });
});

app.post('/test5',function(req,res){
    let pid = req.body.pid;
    Project.findOne({pid:pid},function(err,project){
        if(err){
            return res.json({result:2,msg:'find error'});
        }
        return res.json({result:1,data:project});
    });
});

module.exports = app;