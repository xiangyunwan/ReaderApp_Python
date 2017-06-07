var mongoose = require('mongoose');
var collection = mongoose.model('User');

/**
 * 根据登录名查找用户
 * Callback:
 * - err, 数据库异常
 * - user, 用户
 * @param {String} loginName 登录名
 * @param {Function} callback 回调函数
 */
exports.getUserByLoginName = function (loginName, callback) {
    collection.findOne({'loginname': loginName}, callback);
};


/**
 * 根据昵称查找用户
 * Callback:
 * - err, 数据库异常
 * - user, 用户
 * @param {String} loginName 登录名
 * @param {Function} callback 回调函数
 */
exports.getUserByName = function (loginName, callback) {
    collection.findOne({'name': loginName}, callback);
};


/**
 * 根据关键字，获取一组用户
 * Callback:
 * - err, 数据库异常
 * - users, 用户列表
 * @param {String} query 关键字
 * @param {Object} opt 选项
 * @param {Function} callback 回调函数
 */
exports.getUsersByQuery = function (query, opt, callback) {
    collection.find(query, '', opt, callback);
};

/**
 * 根据用户id，获取用户
 * Callback:
 * - err, 数据库异常
 * - user, 用户
 * @param {String} query 关键字
 * @param {Object} opt 选项
 * @param {Function} callback 回调函数
 */
exports.getUsersById = function (uid, callback) {
    collection.findById(uid, callback);
};

/**
 * 更新用户密码
 * Callback:
 * - err, 数据库异常
 * - user, 用户
 * @param {String} query 关键字
 * @param {Object} opt 选项
 * @param {Function} callback 回调函数
 */
exports.resetPass = function (uid, pass, callback) {
    collection.findById(uid, callback);
};