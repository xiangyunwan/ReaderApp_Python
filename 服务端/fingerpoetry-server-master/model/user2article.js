var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var objectSchema = new Schema({
    userId: { type: String, index: true},
    userAvatar:{type: String},
    articleId: { type: String, index: true},
    articleName: String,
    siteName:String,
    siteId:String,
    isBlock: {type: Boolean, default: false},
    share: {type: Boolean, default: false},
    collect: {type: Boolean, default: false},
    heart: {type: Boolean, default: false},
    read: {type: Boolean, default: false},
    toread: {type: Boolean, default: false},
    createAt: { type: Number, default: new Date().getTime() },
    updateAt: { type: Number, default: new Date().getTime() },
});
mongoose.model('User2Article', objectSchema);