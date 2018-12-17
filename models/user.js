const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const db = require('../lib/db');
const Schema = mongoose.Schema;


const userSchema = new Schema({
    uid:Number,
    name:String,
    id:String,
    salt:String,
    pass:String,
    stuNo:String,
    regiDate:Date,
    lastLogin:Date,
    lastUpdate:Number,
    email:String,
    msgList:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'message',
        default:[]
    }],
    projectList:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'project',
        default:[]
    }],
    taskList:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'task',
        default:[]
    }],
    doList:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'do',
        default:[]
    }],
});

userSchema.plugin(autoIncrement.plugin,{
    model:'user',
    field:'uid',
    startAt:1,
    incrementBy:1
})
module.exports = db.model('user',userSchema);

