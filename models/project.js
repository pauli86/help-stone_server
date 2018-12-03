const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const db = require('../lib/db');
const Schema = mongoose.Schema;

const projectSchema = new Schema({
    pid:Number,
    title:String,
    desc:String,
    state:String,
    startDate:Date,
    dueDate:Date,
    doneDate:Date,
    manager:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    }, 
    team:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        default:[]
    }],
    taskList:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'task',
        default:[]
    }],
    logList:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'log',
        default:[]
    }],
    comments:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'comment',
        default:[]
    }],
})

projectSchema.plugin(autoIncrement.plugin,{
    model:'project',
    field:'pid',
    startAt:1,
    incrementBy:1
})
module.exports = db.model('project',projectSchema);