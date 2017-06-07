var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var schema = new Schema({
    no: { type: String, unique: true, index: true},
    articles: {type: Array},
    isBlock: {type: Boolean, default: false},
    createAt: { type: Number, default: new Date().getTime()},
    updateAt: { type: Number, default: new Date().getTime()},
});
mongoose.model('Magzine', schema);