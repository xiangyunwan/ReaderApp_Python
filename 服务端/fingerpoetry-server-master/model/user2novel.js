var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var objectSchema = new Schema({
    uid: { type: String, index: true},
    nid: { type: String, index: true},
    lastRead: { type: Number, default:0}, // 已经阅读的序号
    latestno: { type: Number, default:0}, // 最近更新的序号
    title:  { type: String, index: true},
    desc:{type:String},
    author:  { type: String, index:true},
    href:{type:String},
    type:{type:String},
    image: { type: String, default:"/images/channelbrand.jpg"},
    latest: {type:String},
});
mongoose.model('User2Novel', objectSchema);