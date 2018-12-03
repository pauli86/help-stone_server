const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const db = mongoose.connection;


mongoose.connect('mongodb://localhost/project',{useNewUrlParser:true});
mongoose.plugin(schema => {schema.options.usePushEach = true });

db.on('error',console.error);
db.once('open',function(){
    console.log('Mongo DB Connected');
});

autoIncrement.initialize(db);
module.exports = db;