var CronJob = require('cron').CronJob;
var request = require("request");
var config = require("../config");
module.exports = function () {
    var task = new CronJob(config.croncrawl, function () {
        var options = {
            method: 'POST',
            url: 'http://127.0.0.1:3000/v1/novels/crawl?pass='+config.pass,
            headers: {
                'postman-token': '6633aa11-aafc-2ae0-7026-3cb028cf2810',
                'cache-control': 'no-cache',
                'content-type': 'multipart/form-data; boundary=---011000010111000001101001'
            },
        };
        request(options, function (error, response, body) {
            if (error) {
                console.log(error);
            } else {
                console.log(body);
            }
        });
    }, null, false, 'Asia/Shanghai');
    task.start();
}
