const express = require('express');
const app = express.Router();
const crypto = require('crypto');

const User = require('../models/user');

app.post('/join',function(req,res){
    const apiName ='['+(Date().toLocaleString()).split(' GMT')[0]+'][ USER ][ JOIN ] ';
    console.log(apiName);
    let id = req.body.id?req.body.id:false;    
    let pass = req.body.pass?req.body.pass:false;
    let name = req.body.name?req.body.name:false;
    let stuNo = req.body.stuNo?req.body.stuNo:false;
    
    if(!(id&&pass&&name&&stuNo)){
        console.log(apiName+'parameter check error');
        return res.json({result:3,msg:'모든 항목을 입력하세요.'});
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
        
        crypto.pbkdf2(pass,salt,100000,64,'sha512',(err,key)=>{                       
            if(key.toString('base64')===user.pass){
                console.log(apiName+'login well');
                return res.json({result:1,msg:'로그인 되었습니다.',data:user});
            }
            console.log(apiName+'wrong id or password');
            return res.json({result:4,msg:'로그인에 실패했습니다.'});
        });
    });
});


module.exports = app;