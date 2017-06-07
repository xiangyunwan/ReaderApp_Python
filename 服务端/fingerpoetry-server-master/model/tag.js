var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var schema = new Schema({
    name: { type: String, unique: true, index: true},
    followerCount: { type: Number, default: 0 }, // 
    articleNum: { type: Number, default: 0 }, // 
    isBlock: {type: Boolean, default: false},
    createAt: { type: Number, default: new Date().getTime() },
    updateAt: { type: Number, default: new Date().getTime() },
});
mongoose.model('Tag', schema);