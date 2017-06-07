var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var entitySchema = new Schema({ //
    no: {type: Number, index: true},
    title: {type: String},
    content: {type: String},
    href: {type: String, unique: true},
    nid:{type: String, index: true},
    nname:{type: String},
    author:{type: String}, // 作者
    createAt: {type: Number, default: new Date().getTime()},
    updateAt: {type: Number, default: new Date().getTime()},

});
mongoose.model('Chapter', entitySchema);