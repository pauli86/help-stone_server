const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const db = require('../lib/db');
const Schema = mongoose.Schema;

const taskSchema = new Schema({
    tid:Number,
    title:String,
    desc:String,
    state:String,
    startDate:Date,
    dueDate:Date,
    doneDate:Date,
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    }, // user uid
    doList:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'do',
        default:[]
    }],
    comments:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'comment',
        default:[]
    }],
})

taskSchema.plugin(autoIncrement.plugin,{
    model:'task',
    field:'tid',
    startAt:1,
    incrementBy:1
})
module.exports = db.model('task',taskSchema);