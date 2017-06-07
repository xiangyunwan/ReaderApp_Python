var request = require("request");
var mongoose = require('mongoose');
var cheerio = require('cheerio')
var Chapter = mongoose.model('Chapter');
var Novel = mongoose.model('Novel');
var User2Novel = mongoose.model('User2Novel');
var util = require("../utils/commonutils")
var _ = require("lodash")
var config = require("../config");
const charset = require('superagent-charset');
const superagent = require('superagent');
const proxy = require('superagent-proxy');
proxy(superagent);
charset(superagent);

var maxtry = 5;
function search(name, callback) {
    var url = 'http://zhannei.baidu.com/cse/search?q=' + name;
    var count = {}
    var options = {
        method: 'GET',
        url: 'http://zhannei.baidu.com/cse/search',
        qs: {
            click: '1',
            entry: '1',
            s: '1211228452607586324',
            nsid: '',
            q: name
        },
        headers: {
            'postman-token': '139bd025-2543-1f5d-bd86-08dd9d67f735',
            'cache-control': 'no-cache',
            "gzip": "true",
            "User-Agent": "Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.1; Trident/5.0; SLCC2;.NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0"
        }
    };

    count["count_" + url] = 0;
    function requestData() {
        console.log("url:" + url + " Count:" + JSON.stringify(count))
        count["count_" + url] = count["count_" + url] + 1;
        if (parseInt(count["count_" + url]) > maxtry) {
            return;
        }
        console.log("requestData " + count["count_" + url] + " url:" + url)
        request(options, function (error, response, body) {
            if (error) {
                console.log("crawl err:" + url);
                requestData();
            } else {
                callback(null, body);
            }
        });
    }

    requestData();
}

/**
 * 抓取小说主页目录,检查是否有更新
 * @param url
 * @param callback
 */
function crawUpdates(novel) {
    var pref = "";
    if(novel.href.indexOf("biqugezw.com") != -1){
        pref = 'http://www.biqugezw.com';
    }
    console.log("home crawl " + JSON.stringify(novel));
    crawlPage(novel.href, function (err, body) {
            console.log("home done " + novel.href);
            var $ = cheerio.load(body);
            var datas = []
            var count = 1;
            $('#list > dl > dd > a').each(function (idx, element) {
                var data = {}
                data.href = pref + $(this).attr('href');
                data.title = $(this).text().trim();
                data.no = count++;
                datas.push(data)
            });
            if (datas.length <= 0) {
                return;
            }
            var latestno = novel.latestno;
            var updateInfo = {};
            updateInfo["lastCheck"] = new Date().getTime();
            Novel.update({"_id": novel._id.toString()}, {"$set": updateInfo}).exec();
            // 最大的no <= 当前的最新no, 没有发生更新
            if (latestno >= datas[datas.length - 1].no) {
                console.log("no new update chapter");
                return;
            }

            for (var index = datas.length - 1; index >= 0; index--) {
                console.log("find update chapter " + JSON.stringify(datas[index]));
                if (datas[index].no <= latestno) {
                    break; // 跳出循环
                }
                let data = datas[index];
                var chapter = {}
                chapter.no = data.no;
                chapter.title = data.title;
                chapter.href = data.href;
                chapter.nid = novel._id.toString();
                chapter.nname = novel.title;
                chapter.author = novel.author;
                chapter.createAt = new Date().getTime();
                chapter.updateAt = chapter.createAt;
                Chapter.update({"no": chapter.no, "nid": chapter.nid}, chapter, {upsert: true}).exec();
            }

            var updateInfo = {
                "latest": datas[datas.length - 1].title,
                "latestno": datas[datas.length - 1].no,
                "updateAt": new Date().getTime(),
            }
            User2Novel.update({"nid": novel._id.toString()}, {"$set": updateInfo},{"multi":true}).exec()
            updateInfo["lastCheck"] = new Date().getTime();
            Novel.update({"_id": novel._id.toString()}, {"$set": updateInfo}).exec();
        }
    )
}


function crawlPage(url, callback) {
    var count = {}

    count["count_" + url] = 0;
    function requestData() {
        var index = util.getRandomNum(0, config.ips.length);
        let host;
        let port;
        if (config.ips.length > 0) {
            host = config.ips[index % config.ips.length][0];
            port = parseInt(config.ips[index % config.ips.length][1]);
        }
        var proxyUri = 'http://' + host + ':' + port;
        count["count_" + url] = count["count_" + url] + 1;
        if (parseInt(count[" " + url]) > maxtry) {
            return;
        }
        if (parseInt(count["count_" + url]) == maxtry || host == undefined) {
            superagent
                .get(url)
                .timeout(15000)
                .charset("gbk")
                .set("cache-control","no-cache")
                .set("gzip","true")
                .set("User-Agent","Mozilla/5.0 (Linux; Android 5.1.1; Nexus 6 Build/LYZ28E) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.23 Mobile Safari/537.36")
                .end(onresponse);
        } else {
            superagent
                .get(url)
                .proxy(proxyUri)
                .timeout(15000)
                .charset("gbk")
                .set("cache-control","no-cache")
                .set("gzip","true")
                .set("User-Agent","Mozilla/5.0 (Linux; Android 5.1.1; Nexus 6 Build/LYZ28E) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.23 Mobile Safari/537.36")
                .end(onresponse);
        }


        function onresponse (err, res) {
            if (err || !res.ok) {
            } else {
                callback(null, res.text);
            }
        }
    }

    requestData();
}

function crawProxy() {
    console.log("start crawl ips");
    crawlPage("http://api.xicidaili.com/free2016.txt", function (err, body) {
        var ips = body.split("\r\n");
        var ipArray = []
        for (var index = 0; index < ips.length; index++) {
            ipArray.push(ips[index].split(":"))
        }
        if (ipArray.length > 80) {
            config.ips = ipArray;
            console.log("ipArray:" + config.ips);
        }
    })
}

function crawlContent(chapter){
    console.log("chapter:"+JSON.stringify(chapter))
    crawlPage(chapter.href, function (err, body) {
        console.log("crawlContent done " + chapter.href);
        var $ = cheerio.load(body);
        Chapter.update({"_id": chapter._id.toString()}, {"$set": {"content":$("#content").html()}}).exec();

    })
}
module.exports = {
    search: search,
    crawUpdates: crawUpdates,
    crawlProxy: crawProxy,
    crawlContent:crawlContent,
}