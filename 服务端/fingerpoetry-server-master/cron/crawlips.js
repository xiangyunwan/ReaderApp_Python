var CronJob = require('cron').CronJob;
var request = require("request");
var config = require("../config");
module.exports = function () {
    var task = new CronJob(config.cronproxy, function () {
        require("../utils/crawlutil").crawlProxy();
    }, null, false, 'Asia/Shanghai');
    task.start();
}
