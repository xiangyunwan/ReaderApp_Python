var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var objectSchema = new Schema({
    content: { type: String, unique: true},
    type:{ type: String, unique: true}, // android, ios
    version:{ type: Number, default: 0}, // android, ios
    url:String,
    isBlock: {type: Boolean, default: false},
    createAt: { type: Number, default: new Date().getTime() },
    updateAt: { type: Number, default: new Date().getTime() },
});
mongoose.model('Version', objectSchema);