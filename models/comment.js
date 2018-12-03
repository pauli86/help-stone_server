const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const db = require('../lib/db');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    cid:Number,
    writer:{
        uid:Number,
        name:String,
        id:String,
    },
    refer:{
        label:String, // project, task, do
        id:Number,   // pid or tid
    },
    content:String,
    Date:Date
});

commentSchema.plugin(autoIncrement.plugin,{
    model:'comment',
    field:'cid',
    startAt:1,
    incrementBy:1
});
module.exports = db.model('comment',commentSchema);