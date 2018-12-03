const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const db = require('../lib/db');
const Schema = mongoose.Schema;

const doSchema = new Schema({
    did:Number,
    title:String,
    desc:String,
    state:String, // yet, done
    startDate:Date,
    dueDate:Date,
    doneDate:Date,    
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

doSchema.plugin(autoIncrement.plugin,{
    model:'do',
    field:'did',
    startAt:1,
    incrementBy:1
})
module.exports = db.model('do',doSchema);