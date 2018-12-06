const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const db = require('../lib/db');
const Schema = mongoose.Schema;

const doSchema = new Schema({
    did:Number,
    project:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'project'
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    }, 
    title:String,
    state:String, // yet, done   
    doneDate:Date
})

doSchema.plugin(autoIncrement.plugin,{
    model:'do',
    field:'did',
    startAt:1,
    incrementBy:1
})
module.exports = db.model('do',doSchema);