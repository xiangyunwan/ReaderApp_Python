var mongoose = require('mongoose');
var collection = mongoose.model('Article');

/**
 * 根据登录名查找用户
 * Callback:
 * - err, 数据库异常
 * - user, 用户
 * @param {String} loginName 登录名
 * @param {Function} callback 回调函数
 */
exports.getArticlesByQuery = function (query, opt, callback) {
    collection.find(query, {}, opt, callback);
};
