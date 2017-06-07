var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var channelSchema = new Schema({
    name: { type: String, unique: true, index: true},
    followerCount: { type: Number, default: 0 },
    articleCount: { type: Number, default: 0 }, //
    isBlock: {type: Boolean, default: false},
    image: { type: String, default:"/images/channelbrand.jpg"},
    createAt: { type: Number, default: new Date().getTime() },
    updateAt: { type: Number, default: new Date().getTime() },
});
mongoose.model('Topic', channelSchema);