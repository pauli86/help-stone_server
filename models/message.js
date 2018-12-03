const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const db = require('../lib/db');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
    mid:Number,
    to:Array,
    from:{
        label:String, // manager, member, system
        id:Number,
    },
    flag:String, // notice, question, reply
    content:String,
    sendDate:Date,
    readDate:Date,
    readChk:{
        type:Boolean,
        default:false
    }
});

messageSchema.plugin(autoIncrement.plugin,{
    model:'message',
    field:'mid',
    startAt:1,
    incrementBy:1
});
module.exports = db.model('message',messageSchema);