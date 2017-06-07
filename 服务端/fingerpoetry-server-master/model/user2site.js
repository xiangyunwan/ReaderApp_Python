var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var objectSchema = new Schema({
    userId:  { type: String, index: true},
    userAvatar: String,
    siteId: { type: String, index: true},
    siteName: String,
    isBlock: {type: Boolean, default: false},
    seq: { type: Number, default: 0 },
    createAt: { type: Number, default: new Date().getTime() },
    updateAt: { type: Number, default: new Date().getTime() },
});
mongoose.model('User2Site', objectSchema);