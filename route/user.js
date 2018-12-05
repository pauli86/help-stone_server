const express = require('express');
const app = express.Router();
const crypto = require('crypto');

const User = require('../models/user');
const Project = require('../models/project');

app.post('/join',function(req,res){
    const apiName ='['+(Date().toLocaleString()).split(' GMT')[0]+'][ USER ][ JOIN ] ';
    console.log(apiName);
    let id = req.body.id?req.body.id:false;    
    let pass = req.body.pass?req.body.pass:false;
    let name = req.body.name?req.body.name:false;
    let stuNo = req.body.stuNo?req.body.stuNo:false;
    
    if(!(id&&pass&&name&&stuNo)){
        
    }
    User.count({$or:[{id:id},{stuNo:stuNo}]},function(err,cnt){
        if(cnt!=0){
            console.log(apiName+'duplicate ID or stuNo');
            return res.json({result:4,msg:'ID 또는 학번이 이미 등록되었습니다.'});
        }

        crypto.randomBytes(64, (err, buf) => {
            if(err){
                console.log(apiName+'crypto random bytes error');
                return res.json({result:2,msg:'서버 에러'});
            }
            crypto.pbkdf2(pass, buf.toString('base64'), 100000, 64, 'sha512', (err, key) => {
                if(err){
                    console.log(apiName+'crypto pbkdf2 error');
                    return res.json({result:2,msg:'서버 에러'});
                }
                let user = new User();
                user.id = id;
                user.salt = buf.toString('base64');
                user.pass = key.toString('base64');
                user.name = name;
                user.stuNo = stuNo;
                user.regiDate = new Date();
                console.log(apiName,user);
                user.save(function(err){
                    if(err){
                        console.log(apiName+'db save err');
                        return res.json({result:2,msg:'서버에러'});
                    }
                    console.log(apiName+'join well');
                    return res.json({result:1,msg:'회원가입이 완료되었습니다.',data:user});
                });
            });
        });        
    });
});

app.post('/login',function(req,res){
    const apiName = '['+(Date().toLocaleString()).split(' GMT')[0]+'][ USER ][ LOGIN ] ';
    console.log(apiName);
    let id = req.body.id?req.body.id:false;
    let pass = req.body.pass?req.body.pass:false;

    if(!(id&&pass)){
        console.log(apiName+'parameter check error');
        return res.json({result:3,msg:'ID / 비밀번호를 입력하세요.'});
    }
        
    User.findOne({id:id},function(err,user){
        if(err){
            console.log(apiName+'user find error');
            return res.json({result:2,msg:'서버에러'});
        }            
        if(!user){
            console.log(apiName+'id not found');
            return res.json({result:5,msg:'존재하지 않는 ID 입니다.'});
        }            
        let salt = user.salt;
        let pList = user.projectList;
        user.lastLogin = new Date();
        Project.update({_id:{$in:pList}},{$set:{lastUpdate:new Date()}})
        .then(user.save())
        .then(
            crypto.pbkdf2(pass,salt,100000,64,'sha512',(err,key)=>{
            if(err) throw new Error({msg:'암호화 에러'});
            if(key.toString('base64')===user.pass){
                console.log(apiName+'login well');
                return res.json({result:1,msg:'로그인 되었습니다.',data:user});
            }
            console.log(apiName+'wrong id or password');
            return res.json({result:4,msg:'로그인에 실패했습니다.'});
        }))
        .catch(e=>{
            let msg = '서버에러';
            console.log(apiName+'user save error');
            return res.json({result:2,msg:msg});
        });        
    });
});


app.post('/findId',function(req,res){
    const apiName = '['+(Date().toLocaleString()).split(' GMT')[0]+'][ USER ][ FIND ID ] ';
    console.log(apiName);
    let name = req.body.name?req.body.name:false;
    let stuNo = req.body.stuNo?req.body.stuNo:false;
    if(!(name&&stuNo)){
        console.log(apiName+'parameter check error');
        return res.json({result:3,msg:'이름과 학번을 입력하세요.'});
    }    
    User.findOne({stuNo:stuNo,name:name},{id:1})
    .then((user)=>{
        if(!user){
            console.log(apiName+'user not found');
            return res.json({result:4,msg:'사용자 정보가 없습니다. 이름과 학번을 확인해주세요.'})
        }
        console.log(apiName+'user found');
        return res.json({result:1,msg:'사용자 정보를 찾았습니다.',data:user.id});
    })
    .catch(e=>{
        console.log(apiName+'user find error :', e);
        return res.json({result:2,msg:'서버 에러'});
    });
});

app.post('/resetPW',function(req,res){
    const apiName = '['+(Date().toLocaleString()).split(' GMT')[0]+'][ USER ][ RESET PASSWORD ] ';
    console.log(apiName);
    let id = req.body.id?req.body.id:false;
    let stuNo = req.body.stuNo?req.body.stuNo:false;
    let name = req.body.name?req.body.name:false;
    let pass = req.body.pw?req.body.pw:false;
    if(!(id&&stuNo&&name&&pass)){
        console.log(apiName+'parameter check error');
        return res.json({result:3,msg:'모든 정보를 입력하세요.'});
    }
    crypto.randomBytes(64, (err, buf) => {
        if(err){
            console.log(apiName+'crypto random bytes error');
            return res.json({result:2,msg:'서버 에러'});
        }
        crypto.pbkdf2(pass, buf.toString('base64'), 100000, 64, 'sha512', (err, key) => {
            if(err){
                console.log(apiName+'crypto pbkdf2 error');
                return res.json({result:2,msg:'서버 에러'});
            }
            let salt = buf.toString('base64');
            let pass = key.toString('base64');
            User.findOneAndUpdate({id:id,stuNo:stuNo,name:name},{$set:{salt:salt,pass:pass}})
            .then((data)=>{
                if(!data){
                    console.log(apiName+'user info not found');
                    return res.json({result:5,msg:'사용자 정보가 없습니다. 입력 정보를 확인해주세요.'});
                }
                console.log(apiName+'user pass reset done');
                return res.json({result:1,msg:'비밀번호가 정상적으로 변경되었습니다.',data:data});
            })
            .catch(e=>{
                console.log(apiName+'user find and update error :', e);
                return res.json({result:2,msg:'서버 에러'});
            });
        });
    });    
});

app.post('/view',function(req,res){
    const apiName = '['+(Date().toLocaleString()).split(' GMT')[0]+'][ USER ][ RESET PASSWORD ] ';
    console.log(apiName);
    let manager = req.body.manager?req.body.manager:false;
    let id = req.body.id?req.body.id:false;
    User.count({id:manager})
    .then((cnt)=>{
        if(!cnt){
            console.log(apiName+'invalid project manager id');
            throw new Error('프로젝트 매니저 아이디가 유효하지 않습니다.');
        }
        console.log(apiName+'manager id valid');
        return User.findOne({id:id},{salt:0,pass:0})
    })
    .then((user)=>{
        if(!user){
            console.log(apiName+'invalid user id');
            throw new Error('유저 아이디가 유효하지 않습니다.');
        }
        console.log(apiName+'user id valid');
        return res.json({result:1,msg:'유저 정보를 찾았습니다.',data:user})
    })
    .catch(e=>{
        let msg = e?e:'서버에러';        
        console.log(apiName+'user find error');
        return res.json({result:2,msg:msg});
    })
})


module.exports = app;