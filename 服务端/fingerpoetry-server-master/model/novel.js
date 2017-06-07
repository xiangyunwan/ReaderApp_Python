var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var entitySchema = new Schema({ //
    title:  { type: String, index: true},
    desc:{type:String},
    author:  { type: String, index:true},
    href:{type:String, unique:true},
    type:{type:String},
    image: { type: String, default:"/images/channelbrand.jpg"},
    latest:{type:String},
    latestno:{type:Number, default:0}, // 最近更新的序号
    notifyno:{type:Number, default:0},
    lastCheck:{type:Number, default: 0 }, // 上次抓取时间
    followerCount: { type: Number, default: 0 },
    articleCount: { type: Number, default: 0 },
    updateAt: { type: String, },

});
mongoose.model('Novel', entitySchema);