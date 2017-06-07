var request = require("request");
var _ = require("lodash")
var md5 = require('md5');
var util = require("util");
var config = require("../config")
function sendNotify(devices, title, chapter, author, cid) {
    let appkey = config.umeng_app_key
    let app_master_secret = config.umeng_master_key
    let timestamp = new Date().getTime();
    let method = 'POST'
    let url = 'http://msg.umeng.com/api/send'
    if(author == undefined){
        author = "";
    }
    var message={
        "type": "novelupate",
        "title": "指尖书香:《"+title+"》更新了啦",
        "desc": chapter+",快来阅读吧",
        "cid": cid,
    }
    let params = {
        'appkey': appkey,
        'timestamp': timestamp,
        'device_tokens': devices + "",
        'type': 'listcast',
        'payload': {
            "display_type":"message",
            "body":{
                "custom":JSON.stringify(message),
            }
        }
    }
    
    let post_body = JSON.stringify(params)
    console.log("send notify post body:" + post_body);
    let str = util.format('%s%s%s%s', method, url, post_body, app_master_secret);
    let token = md5(str);

    function requestData() {
        var headers = {
            'Content-Type': 'application/json',
        };
        var options = {
            method: 'POST',
            url: url + "?sign="+token,
            headers: headers,
            body: params,
            json: true
        };

        request(options, function (error, response, body) {
            if (error) throw console.log("send notifi err:"+error.message)
            console.log("send notify result:"+JSON.stringify(body));
        });
    }

    requestData();
}

module.exports = {
    sendNotify: sendNotify
}