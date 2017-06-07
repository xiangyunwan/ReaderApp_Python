var express = require('express');
var mongoose = require('mongoose');
var validator = require('validator');
var eventproxy = require('eventproxy');
var pro_error = "prop_error";
var unfind = "unfind";
var bodyParser = require('body-parser'); // parses information from POST
var methodOverride = require('method-override'); //used to manipulate POST
var Novel = mongoose.model('Novel');
var User = mongoose.model('User');
var User2Novel = mongoose.model('User2Novel');
var Chapter = mongoose.model('Chapter');
var httputil = require("../../utils/crawlutil")
var DEFAULT_PAGE_SIZE = 10; // 默认每页数量
var DEFAULT_PAGE = 1; // 默认页号
var router = express.Router();
var validateToken = require("../../utils/authutil").validateToken;
var cheerio = require('cheerio')
var config = require("../../config")
var notifiUtil = require("../../utils/notifylutil")
router.use(bodyParser.urlencoded({extended: true}))
router.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method
        delete req.body._method
        return method
    }
}))

/**
 * 查找所想订阅的书籍
 */
router.get('/search',
    function (req, res, next) {
        if (req.query.name) {
            console.log("start search " + req.query.name);
            httputil.search(req.query.name, function (err, body) {
                if (err) {
                    res.json({
                        code: 404,
                        msg: "没有找到相关的小说"
                    })
                } else {
                    var $ = cheerio.load(body);
                    var datas = []
                    $('#results > div.result-list > div.result-item').each(function (idx, element) {
                        // div.result-game-item-detail > h3 > a
                        var data = {}
                        data.image = $(this).find('.result-game-item-pic').find('a').find('img').attr('src');
                        data.title = $(this).find('.result-game-item-detail').find('h3').find('a').text().trim();
                        data.href = $(this).find('.result-game-item-detail').find('h3').find('a').attr('href');
                        data.desc = $(this).find('.result-game-item-detail').find('.result-game-item-desc').text().trim();
                        var count = 0;
                        $(this).find('.result-game-item-detail')
                            .find('.result-game-item-info')
                            .find('.result-game-item-info-tag')
                            .find("span")
                            .each(function (iidx, eelement) {
                                var text = $(this).text().trim();
                                if (count == 1) {
                                    data.author = text;
                                } else if (count == 3) {
                                    data.type = text;
                                } else if (count == 5) {
                                    data.updateAt = text;
                                } else if (count == 7) {
                                    data.latest = text;
                                }
                                count++;
                            })
                        $(this).find('.result-game-item-detail')
                            .find('.result-game-item-info')
                            .find('.result-game-item-info-tag')
                            .find("a")
                            .each(function (iidx, eelement) {
                                var text = $(this).text().trim();
                                data.latest = text;
                            })
                        datas.push(data)
                    });
                    res.send({
                        code: 200,
                        data: datas
                    });
                }
            })
        } else {
            res.json({
                code: 404,
                msg: "没有找到相关的小说"
            })
        }
    });



/**
 * subscribe entity
 */
router.post('/',
    validateToken, function (req, res, next) {

        var ep = new eventproxy();
        ep.fail(next);
        ep.on(pro_error, function (msg) {
            res.status(400).json({
                status: 40001,
                msg: msg,
            })
        });
        var data = {};
        if (req.body.title) {
            data.title = validator.trim(req.body.title);
        }

        if (req.body.desc) {
            data.desc = validator.trim(req.body.desc);
        }

        if (req.body.author) {
            data.author = validator.trim(req.body.author);
        }

        if (req.body.href) {
            data.href = validator.trim(req.body.href);
        }

        if (req.body.type) {
            data.type = validator.trim(req.body.type);
        }

        if (req.body.image) {
            data.image = validator.trim(req.body.image);
        }

        if (req.body.latest) {
            data.latest = validator.trim(req.body.latest);
        }

        var newCreate = false;
        Novel
            .find({'title': data.title, "author": data.author})
            .exec()
            .then((datas)=> {
                return new Promise((resolve, reject)=> {
                    if (datas.length > 0) {
                        resolve(datas[0]);
                    } else {
                        data.updateAt = new Date().getTime();
                        data.createAt = new Date().getTime();
                        Novel.create(data, function (err, entity) {
                            if (err) {
                                reject(err)
                            } else {
                                newCreate = true;
                                resolve(entity)
                            }
                        })
                    }
                })
            })
            .then((novel)=> {
               res.json({
                   status:200
               })
            })
            .catch((err)=>next(err));
    });


/**
 * subscribe entity
 */
router.post('/subscribe',
    validateToken, function (req, res, next) {

        var ep = new eventproxy();
        ep.fail(next);
        ep.on(pro_error, function (msg) {
            res.status(400).json({
                status: 40001,
                msg: msg,
            })
        });
        var data = {};
        if (req.body.title) {
            data.title = validator.trim(req.body.title);
        }

        if (req.body.desc) {
            data.desc = validator.trim(req.body.desc);
        }

        if (req.body.author) {
            data.author = validator.trim(req.body.author);
        }

        if (req.body.href) {
            data.href = validator.trim(req.body.href);
        }

        if (req.body.type) {
            data.type = validator.trim(req.body.type);
        }

        if (req.body.image) {
            data.image = validator.trim(req.body.image);
        }

        if (req.body.latest) {
            data.latest = validator.trim(req.body.latest);
        }

        var newCreate = false;
        Novel
            .find({'title': data.title, "author": data.author})
            .exec()
            .then((datas)=> {
                return new Promise((resolve, reject)=> {
                    if (datas.length > 0) {
                        resolve(datas[0]);
                    } else {
                        data.updateAt = new Date().getTime();
                        data.createAt = new Date().getTime();
                        Novel.create(data, function (err, entity) {
                            if (err) {
                                reject(err)
                            } else {
                                newCreate = true;
                                httputil.crawUpdates(entity) // 新建,初始化抓取目录
                                resolve(entity)
                            }
                        })
                    }
                })
            })
            .then((novel)=> {
                var data = {};
                data.uid = req.user._id;
                data.nid = novel._id;
                User2Novel
                    .find(data)
                    .exec()
                    .then((datas)=> {
                        return new Promise((resolve, reject)=> {
                            if (datas.length > 0) {
                                res.status(200).json(
                                    {
                                        status: 403,
                                        msg: "已经订阅"
                                    }
                                );
                            } else {
                                data.title = novel.title;
                                data.desc = novel.desc;
                                data.author = novel.author;
                                data.href = novel.href;
                                data.type = novel.type;
                                data.image = novel.image;
                                data.latest = novel.latest;
                                data.latestno = novel.no;
                                data.lastRead = novel.no;
                                User2Novel.create(data, function (err, entity) {
                                    if (err) {
                                        res.status(500).json(
                                            {
                                                status: 500,
                                                msg: err.message
                                            }
                                        );
                                    } else {
                                        Novel.update({"_id": novel._id}, {$inc: {"followerCount": 1}}).exec()
                                        User.update({"_id": req.user._id}, {$addToSet: {"novels": novel._id.toString()}}).exec()
                                        res.json({
                                            status: 200,
                                            data: entity
                                        });
                                    }
                                })
                            }
                        })
                    })
            })
            .catch((err)=>next(err));
    });


/**
 * subscribe entity
 */
router.post('/:id/subscribe',
    validateToken, function (req, res, next) {
        console.log("subscribe by id");
        var ep = new eventproxy();
        ep.fail(next);
        ep.on(pro_error, function (msg) {
            res.status(400).json({
                status: 40001,
                msg: msg,
            })
        });


        Novel
            .find({'_id': req.params.id})
            .exec()
            .then((datas)=> {
                return new Promise((resolve, reject)=> {
                    if (datas.length > 0) {
                        resolve(datas[0]);
                    } else {
                        res.status(404).json(
                            {
                                status: 404,
                                msg: "小说不存在"
                            }
                        );
                    }
                })
            })
            .then((novel)=> {
                var data = {};
                data.uid = req.user._id;
                data.nid = novel._id;
                User2Novel
                    .find(data)
                    .exec()
                    .then((datas)=> {
                        return new Promise((resolve, reject)=> {
                            if (datas.length > 0) {
                                res.status(200).json(
                                    {
                                        status: 403,
                                        msg: "已经订阅"
                                    }
                                );
                            } else {
                                data.title = novel.title;
                                data.desc = novel.desc;
                                data.author = novel.author;
                                data.href = novel.href;
                                data.type = novel.type;
                                data.image = novel.image;
                                data.latest = novel.latest;
                                data.latestno = novel.no;
                                data.lastRead = novel.no;
                                User2Novel.create(data, function (err, entity) {
                                    if (err) {
                                        res.status(500).json(
                                            {
                                                status: 500,
                                                msg: err.message
                                            }
                                        );
                                    } else {
                                        Novel.update({"_id": novel._id}, {$inc: {"followerCount": 1}}).exec()
                                        User.update({"_id": req.user._id}, {$addToSet: {"novels": novel._id.toString()}}).exec()
                                        res.json({
                                            status: 200,
                                            data: entity
                                        });
                                    }
                                })
                            }
                        })
                    })
            })
            .catch((err)=>next(err));
    });


router.get('/novels/:id', function (req, res, next) {
    console.log("id:" + req.params.id);
    Novel.findById(req.params.id, function (err, entity) {
        if (err) {
            next(err);
        } else {
            if (entity) {
                res.json({
                    status: 200,
                    data: entity,
                })
            } else {
                res.status(404).json(
                    {
                        status: 404,
                        message: "没有找到相关小说"
                    }
                );
            }
        }
    });
});

router.get('/chapters/:id', function (req, res, next) {
    console.log("id:" + req.params.id);
    Chapter.findById(req.params.id, function (err, entity) {
        if (err) {
            next(err);
        } else {
            if (entity) {
                res.json({
                    status: 200,
                    data: entity,
                })
            } else {
                res.status(404).json(
                    {
                        status: 404,
                        message: "没有找到相关章节"
                    }
                );
            }
        }
    });
});


/**
 * undelete entity
 */
router.post('/:id/unsubscribe',
    validateToken, function (req, res) {
        var user = req.user;
        var conditions = {};
        conditions.nid = req.params.id;
        conditions.uid = user._id;
        User2Novel.remove(conditions, function (err, entity) {
            if (err) {
                res.status(200).json(
                    {
                        status: 404,
                        msg: err.message
                    }
                );
                return;
            }
            entity = JSON.parse(entity);
            if (parseInt(entity["n"]) > 0) {
                Novel.update({"_id": req.params.id}, {$inc: {"followerCount": -1}}).exec()
                User.update({"_id": req.user._id}, {$pop: {"novels": req.params.id}}).exec()
                res.json({
                    status: 200,
                })
            } else {
                res.json({
                    status: 200,
                })
            }
        })
    });


/**
 * undelete entity
 */
router.get('/recommend', function (req, res) {
    Novel
        .find({})
        .limit(20)
        .sort({'updateAt': -1})
        .exec()
        .then((datas)=> {
            res.json({
                code:200,
                data:datas,
            })
        })
});

/**
 * 支持分页查询
 */
router.get('/:id/chapters', function (req, res) {
    var pageSize = req.query.pageSize > 0 ? req.query.pageSize : DEFAULT_PAGE_SIZE;
    var page = req.query.page > 0 ? req.query.page : DEFAULT_PAGE;
    var conditions = {"nid": req.params.id};
    console.log("get novel chapters:"+conditions.nid+" "+page+" "+pageSize);
    var query = Chapter.find(conditions);
    query.select('no title href nid nname author updateAt createAt')
    query.skip((page - 1) * pageSize);
    query.limit(pageSize * 1);
    query.sort('-no desc');
    query.exec(function (err, entity) {
        if (err) {
            return next(err);
        } else {
            res.format({
                json: function () {
                    res.json({
                        status: 200,
                        data: entity
                    });
                }
            });
        }
    });
});

router.post('/crawl', function (req, res) {
    if(req.query.pass && req.query.pass == config.pass){
        var date = new Date();
        var time = date.getTime() - 900000; // 15分钟检查一次是否存在更新
        Novel
            .find({'lastCheck': {$lt: time}})
            .limit(5)
            .exec()
            .then((datas)=> {
                console.log("need to crawl update size:"+datas.length)
                for (var index = 0; index < datas.length; index++) {
                    console.log("try crawl udpate:" + datas[index].title);
                    crawl(datas[index]);
                }
            })
        res.send("success");
    } else {
        res.send("fail");
    }

});


router.post('/crawlcontent', function (req, res) {
    if(req.query.pass && req.query.pass == config.pass){
        Chapter
            .find( { "content": { $exists: false } } )
            .sort({'updateAt': -1})
            .limit(5)
            .exec()
            .then((datas)=> {
                console.log("need to crawl content size:"+datas.length)
                for (var index = 0; index < datas.length; index++) {
                    console.log("try crawl udpate content:" + datas[index].title);
                    httputil.crawlContent(datas[index]);
                }
            })
        res.send("success");
    } else {
        res.send("fail");
    }

});

router.get('/notify', function (req, res) {
    console.log("start notify task")
    if(req.query.pass && req.query.pass == config.pass){
        console.log("start notify")
        var condition = {
            $where : "this.notifyno < this.latestno"
        }
        Novel
            .find(condition)
            .select('_id author title href latest latestno')
            .exec()
            .then((datas)=> {
                datas.forEach(function (data) {
                    console.log("find need notify novels:"+data)
                    Novel.update({"_id": data._id}, {$set: {"notifyno": data.latestno, "updateAt":new Date().getTime()}}).exec()
                    Chapter
                        .find({"nid":data._id, "no":data.latestno})
                        .exec()
                        .then((chapters)=> {
                            if(chapters.length > 0){
                                let cid = chapters[0]._id;
                                try {
                                    User
                                        .find({"novels": {"$in":[data._id.toString()]}})
                                        .select('deviceToken')
                                        .exec()
                                        .then(function (entities) {
                                            console.log("find need notify devices:"+entities)
                                            var devices = [];
                                            for(var index = 0; index < entities.length; index++){
                                                if(devices.length < 400){
                                                    devices.push(entities[index]["deviceToken"]) // 400一组发送消息
                                                } else {
                                                    notifiUtil.sendNotify(devices, data.title, data.latest, data.author, cid);
                                                    devices = [];
                                                    devices.push(entities[index]["deviceToken"]);
                                                }
                                            }
                                            if(devices.length > 0){
                                                notifiUtil.sendNotify(devices, data.title, data.latest, data.author, cid);
                                            }
                                        })
                                } catch (e) {
                                    console.log("error:"+e.message)
                                }
                            }
                        })
                    
                })
            })
        res.send("success");
    } else {
        res.send("fail");
    }
});

function crawl(novel) {
    httputil.crawUpdates(novel);
}

module.exports = router;
