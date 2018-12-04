const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const db = require('../lib/db');
const Schema = mongoose.Schema;

const logSchema = new Schema({
    lid:Number,
    project:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'project'
    },
    task:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'task'
    },
    do:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'do'
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    sector:String, // p, t, d, u
    title:String,
    action:String, // create, retrieve, update, delete
    date:Date,
});

logSchema.plugin(autoIncrement.plugin,{
    model:'log',
    field:'lid',
    startAt:1,
    incrementBy:1
});
module.exports = db.model('log',logSchema);