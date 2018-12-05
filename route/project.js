const express = require('express');
const mongoose = require('mongoose');
const app = express.Router();

const User = require('../models/user');
const Project = require('../models/project');
const Task = require('../models/task');
const Log = require('../models/log');
const Do = require('../models/todo');

app.post('/viewAll',function(req,res){
    const apiName ='['+(Date().toLocaleString()).split(' GMT')[0]+'][ PROJECT ][ VIEW ALL ] ';
    console.log(apiName);
    let uid = req.body.uid?req.body.uid:false;
    let data = {
        task:{
            total:0,
            done:0
        },
        do:{
            total:0,
            done:0
        },
        ongoing:[],
        done:[]        
    };
    if(!uid){
        console.log(apiName+'parameter check error');
        return res.json({result:3,msg:'서버 에러'});
    }
    User.findOne({_id:mongoose.Types.ObjectId(uid)})
    .then((user)=>{
        return Project.find({
            _id:{
                $in:user.projectList.map(function(o){
                    return mongoose.Types.ObjectId(o);
                })
            }
        }).populate({path:'manager',select:'id name email'})
        .populate({path:'team',select:'id name email'});       
    })
    .then((projects)=>{
        // 프로젝트 매니저 정보, 팀원 정보, 태스크리스트 (진행중,완료) 갯수
        let tasks = [];
        projects.map((project)=>{
            if(project.state==='done'){
                data.done.push(project);
                tasks.push(...project.taskList);
            }else{
                data.ongoing.push(project);
            }
        });
        data.task.total = tasks.length;
        return Task.find({_id:tasks.map((t)=>{
            return mongoose.Types.ObjectId(t);
        })})
    })
    .then((tasks)=>{ // task 진행도 전체 카운트
        let dos = [];
        tasks.map((task)=>{
            if(task.state==='done') data.task.done++;
            dos.push(...task.doList);
        });
        data.do.total = dos.length;
        return Do.count({_id:{$in:dos.map(d=>mongoose.Types.ObjectId(d))},state:'done'})
    })
    .then((doneCnt)=>{
        data.do.done = doneCnt;
        console.log(apiName+' get project info complete');
        return res.json({result:1,msg:'프로젝트 리스트를 찾았습니다.',data:data});
    })
    .catch(e=>{
        console.log(apiName+'user find and update error :', e);
        return res.json({result:2,msg:'서버 에러'});
    });    
});

app.post('/view',function(req,res){
    const apiName ='['+(Date().toLocaleString()).split(' GMT')[0]+'][ PROJECT ][ VIEW ] ';
    console.log(apiName);
    let pid = req.body.pid?req.body.pid:false;
    let data = {};
    let errMsg ='';
    Project.findOne({_id:pid})
    .populate({path:'manager',select:'name id email'})
    .populate({path:'team',select:'name id email'})
    .populate({path:'taskList',model:'task'})
    .populate({path:'logList',model:'log'})
    .then((project)=>{
        if(!project){
            console.log(apiName+'project find error');
            errMsg ='프로젝트를 찾을 수 없습니다';
            throw new Error();
        }
        Object.assign(data,{project:project});

    //     return User.findOne({_id:project.manager})
    // })
    // .then((manager)=>{
    //     if(!manager){
    //         console.log(apiName+'manager find error');
    //         errMsg='프로젝트 매니저 정보를 찾을 수 없습니다.';
    //         throw new Error();
    //     }
    //     Object.assign(data,{manager:manager});
    //     return User.find({_id:{$in:project.team}})
    // })
    // .then((team)=>{
    //     if(!team){
    //         console.log(apiName+'team find error');
    //         errMsg='팀 정보를 찾을 수 없습니다.';
    //         throw new Error();
    //     }
    //     Object.assign(data,{team:team});
    //     return Task.find({_id:project.taskList})
    // })
    // .then((task)=>{
    //     if(!task){
    //         console.log(apiName+'task find error');
    //         errMsg='태스크 정보를 찾을 수 없습니다.';
    //         throw new Error();
    //     }
    //     Object.assign(data,{task:task});
    //     return Log.find({_id:project.logList})
    // })
    // .then((log)=>{
    //     if(!log){
    //         console.log(apiName+'log find error');
    //         errMsg='로그 정보를 찾을 수 없습니다.';
    //         throw new Error();
    //     }
    //     Object.assign(data,{log:log});
        return res.json({result:1,msg:'프로젝트 정보를 찾았습니다.',data:data});
    })
    .catch((e)=>{        
        let msg = errMsg!==''?errMsg:'서버에러';
        console.log(apiName+'project error catch',e);
        return res.json({result:2,msg:msg});
    });
})

app.post('/add',function(req,res){
    const apiName ='['+(Date().toLocaleString()).split(' GMT')[0]+'][ PROJECT ][ ADD ] ';
    console.log(apiName);
    let errMsg = '';
    let title = req.body.title?req.body.title:false;
    let dueDate = req.body.dueDate?req.body.dueDate:false;
    let desc = req.body.desc?req.body.desc:false;
    let manager = req.body.manager?req.body.manager:false;
    let team = req.body.team?req.body.team:[];

    if(!(title&&dueDate&&desc&&manager)){
        console.log(apiName+'parameter check error');
        return res.json({result:3,msg:'모든 항목을 입력하세요.'});
    }
    let project = new Project();
    project.title = title;
    project.desc = desc;
    project.dueDate = new Date(dueDate);
    project.lastUpdate = new Date();
    project.startDate = new Date();
    project.state = 'ongoing';
    project.manager = manager;
    project.team = team;
    let users = [];
    users.push(...team,manager);
    console.log(users);
    User.update({_id:{
        $in:users.map(u=>{
            console.log(u);
            return mongoose.Types.ObjectId(u);
        })
    }},{$push:{projectList:project._id}},{multi:true})
    .then((result)=>{
        if(!result.ok){
            console.log(apiName+' user project list update error');            
            throw new Error();
        }
        let log = new Log();
        log.project = project._id;
        log.sector = 'project';
        log.title = project.title;
        log.action = 'create';
        log.date = new Date();
        log.save();        
        project.logList.push(log._id);
        return User.find({
            _id:{
                $in:users.map(u=>{
                    return mongoose.Types.ObjectId(u);
                })
            }
        },function(err,users){
            users.map((u)=>{
                let log = new Log();
                log.project = project._id;
                log.user = u._id;
                log.sector = 'user';
                log.title = u.name + '('+u.id+')';
                log.action = 'join';
                log.date = new Date();
                log.save();                
                project.logList.push(log._id);
                console.log(u.name,' - log ok');
            });
            console.log('project saved');
//            return project.save();
        })
        
        
    })    
    .then((result)=>{
        if(!result){
            console.log(apiName+' project save error');            
            throw new Error();
        }      
        project.save();  
        console.log(apiName+' new project add complete');
        return res.json({result:1,msg:'프로젝트를 생성하였습니다.',data:project});
    })
    .catch(e=>{
        console.log(e);
        let msg = errMsg!==''?errMsg:'서버에러';
        return res.json({result:2,msg:msg});
    });
});

app.post('/update',function(req,res){
    const apiName ='['+(Date().toLocaleString()).split(' GMT')[0]+'][ PROJECT ][ UPDATE ] ';
    console.log(apiName);
    let errMsg = '';
    let pid = req.body.pid?req.body.pid:false;
    let title = req.body.title?req.body.title:false; // 그냥 수정
    let desc = req.body.desc?req.body.desc:false; // 그냥 수정
    let dueDate = req.body.dueDate?req.body.dueDate:false;
    let removeTeam = req.body.removeTeam?req.body.removeTeam:false;
    // 해당 팀원의 태스크 할일 삭제
    let addTeam = req.body.addTeam?req.body.addTeam:false;
    // 해당 팀원 추가 로그

    if((!pid)||!(title||desc||dueDate||removeTeam||addTeam)){
        console.log(apiName+'parameter check error');
        return res.json({result:3,msg:'입력값을 확인하세요.'});
    }
    
    let log = new Log();
    log.date = new Date();
    

    Project.findOneAndUpdate(
        {_id:mongoose.Types.ObjectId(pid)},
        {$set:{lastUpdate:new Date()}},
        {new:true}
    )
    .then(async (project)=>{
        console.log(project);
        if(!project){
            console.log(apiName+'project find error');
            errMsg ='프로젝트를 찾을 수 없습니다';
            throw new Error();
        }
        if(title){ // 제목 변경
            log.project = project._id;
            log.sector = 'project';
            log.title = '프로젝트명 - "'+project.title+'" -> "'+title+'"';
            log.action = 'update';
            log.save();
            project.title = title;
            project.logList.push(log._id);
        }else if(desc){ // 설명 변경
            log.project = project._id;
            log.sector = 'project';
            log.title = '프로젝트 설명 - "'+project.desc+'" -> "'+desc+'"';
            log.action = 'update';
            log.save();
            project.desc = desc;
            project.logList.push(log._id);
        }else if(dueDate){
            log.project = project._id;
            log.sector = 'project';
            log.title = '프로젝트 마감일 - "'+(new Date(project.dueDate)).toLocaleDateString()+'" -> "'+(new Date(dueDate)).toLocaleDateString()+'"';
            log.action = 'update';
            log.save();
            project.dueDate = new Date(dueDate);
            project.logList.push(log._id);
        }else if(addTeam){
            let user = await User.findOneAndUpdate({
                _id:mongoose.Types.ObjectId(addTeam)
            },{
                $push:{projectList:project._id}
            },{
                id:1,name:1
            },function(err,user){
                if(err){
                    console.log(apiName+'user find error');                    
                    throw new Error();
                }
                return user;
            });
            log.project = project._id;
            log.sector = 'user';
            log.title = user.name + '('+user.id+')';
            log.action = 'join';
            log.save();
            project.team.push(addTeam);
            project.logList.push(log._id);            
        }else if(removeTeam){
            let user = await User.findOneAndUpdate({
                _id:mongoose.Types.ObjectId(removeTeam)
            },{
                $pull:{projectList:project._id}
            },{
                id:1,name:1
            },function(err,user){
                if(err){
                    console.log(apiName+'user find error');                    
                    throw new Error();
                }            
                return user;
            })
            log.project = project._id;
            log.sector = 'user';
            log.title = user.name + '('+user.id+')';
            log.action = 'out';
            log.save();
            let idx = project.team.indexOf(removeTeam);
            project.team.splice(idx,1);
            project.logList.push(log._id);            
        }
        return project.save();
    })
    .then((result)=>{
        if(!result){
            console.log(apiName+'project save error');
            throw new Error();
        }
        console.log(apiName+' project update complete');
        return res.json({result:1,msg:'프로젝트가 수정되었습니다.',data:result})
    })
    .catch(e=>{
        console.log(e);
        let msg = errMsg!==''?errMsg:'서버에러';
        return res.json({result:2,msg:msg});
    })
})

app.post('/delete',function(req,res){
    const apiName = '['+(Date().toLocaleString()).split(' GMT')[0]+'][ PROJECT ][ DELETE ] ';
    console.log(apiName);
    let pid = req.body.pid?req.body.pid:false;
    let manager = req.body.manager?req.body.manager:false;
    let taskList = [];
    let doList = [];
    let errMsg = '';
    
    let log = new Log();
    log.date = new Date();
    log.action = 'delete';
    log.sector = 'project';
    log.user = manager;

    Project.findOne({_id:mongoose.Types.ObjectId(pid),manager:manager})
    .populate({path:'taskList',model:'task'})
    .then((project)=>{
        log.title = project.title + ' ' + project.desc;
        taskList = project.taskList;
        taskList.map((t)=>{
            doList.push(...t.doList);
        })
        return Task.remove({_id:{
            $in:taskList.map(t=>mongoose.Types.ObjectId(t))
        }})
    })
    .then(result=>{
        console.log('==== task list delete result ====',result);
        return Do.remove({_id:{
            $in:doList.map(d=>mongoose.Types.ObjectId(d))
        }})
    })
    .then(result=>{
        console.log('==== do list delete result ====',result);        
        return Project.remove({_id:mongoose.Types.ObjectId(pid),manager:manager});        
    })
    .then(result=>{
        console.log(apiName+' project has been removed.');  
        return res.json({result:1,msg:'프로젝트가 삭제되었습니다.',data:result});
    })    
    .catch(e=>{
        console.log(e);
        let msg = errMsg!==''?errMsg:'서버에러';
        return res.json({result:2,msg:msg});
    });
});

app.post('/timechk',function(req,res){
    const apiName = '['+(Date().toLocaleString()).split(' GMT')[0]+'][ PROJECT ][ TIME CHECK ] ';
    console.log(apiName);
    let pid = req.body.pid?req.body.pid:false;
    let cTime = req.body.cTime?req.body.cTime:false;
    

    if(!(pid&&cTime)){
        console.log(apiName+'parameter check error');
        return res.json({result:3,msg:'모든 정보를 입력하세요.'});
    }
    Project.count({
        _id:mongoose.Types.ObjectId(pid),
        lastUpdate:{
            $gt:new Date(cTime)
        }
    })
    .then((cnt)=>{
        if(!cnt){ // 변경사항 없는것
            console.log(apiName+' no change');
            return res.json({result:1,msg:'업데이트 없음'});
        }else{
            console.log(apiName+ ' update');
            return Project.findOne({_id:pid})
            .populate({path:'manager',select:'name id email'})
            .populate({path:'team',select:'name id email'})
            .populate({path:'taskList',model:'task'})
            .populate({path:'logList',model:'log'})
        }
    })
    .then((project)=>{
        if(!project){
            console.log(apiName+'project find error');
            errMsg ='프로젝트를 찾을 수 없습니다';
            throw new Error();
        }
        console.log(apiName+' found updated project info');
        return res.json({result:7,msg:'업데이트 완료',data:project});
    })
    .catch((e)=>{        
        let msg = errMsg!==''?errMsg:'서버에러';
        console.log(apiName+'project error catch',e);
        return res.json({result:2,msg:msg});
    });
})

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
            pList = [...user.projectList,project];
            user.projectList = pList;
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