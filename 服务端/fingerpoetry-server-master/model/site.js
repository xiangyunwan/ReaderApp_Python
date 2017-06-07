var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var channelSchema = new Schema({
    name:  { type: String, unique: true, index: true},
    srcUrl:  { type: String, unique: true},
    followerCount: { type: Number, default: 0 },
    articleCount: { type: Number, default: 0 }, //
    isBlock: {type: Boolean, default: false},
    image: { type: String, default:"/images/channelbrand.jpg"},
    createAt: { type: Number, default: new Date().getTime() },
    updateAt: { type: Number, default: new Date().getTime() },
    type:{type:Number, default: 1} // 站点类型, 1:普通类型站点,2:短笑话网站
});
mongoose.model('Site', channelSchema);