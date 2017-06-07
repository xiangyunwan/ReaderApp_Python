var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var objectSchema = new Schema({
    userId: { type: String, index: true},
    userAvatar: String,
    topicId: String,
    topicName: String,
    isBlock: {type: Boolean, default: false},
    seq: { type: Number, default: 0 },
    createAt: { type: Number, default: new Date().getTime() },
    updateAt: { type: Number, default: new Date().getTime() },
});
mongoose.model('User2Topic', objectSchema);