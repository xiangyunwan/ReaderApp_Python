var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var objectSchema = new Schema({
    title: String,
    content:String,
    publishAt: { type: Number, default: new Date().getTime() },
    author:String,
    authorId:String,
    site:String,
    siteId:String,
    srcUrl:{ type: String, unique: true, index: true},
    topics:Array,
    age:String,
    heartCount:{ type:Number,default:0, index: true},
    readCount:{ type:Number,default:0, index: true},
    collectCount:{ type:Number,default:0, index: true},
    shareCount:{ type:Number,default:0, index: true},
    commentCount:{ type:Number,default:0, index: true},
    createAt: { type: Number, default: new Date().getTime() },
    updateAt: { index: true, type: Number, default: new Date().getTime() },
    checked:{type:Boolean, default: false},
    reason:{type:String, default:"请稍候小小君审核!"},
    isBlock: {type: Boolean, default: false},
});
mongoose.model('Article', objectSchema);