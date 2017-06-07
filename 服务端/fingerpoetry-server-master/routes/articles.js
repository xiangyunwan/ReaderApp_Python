var express = require('express');
var mongoose = require('mongoose');
var Article = mongoose.model('Article');
var Topic = mongoose.model('Topic');
var Site = mongoose.model('Site');
var User = mongoose.model('User');
var User2Article = mongoose.model('User2Article')
var validator = require('validator');
var eventproxy = require('eventproxy');
var pro_error = "prop_error";
var unfind = "unfind";
var router = express.Router();
var bodyParser = require('body-parser'); // parses information from POST
var methodOverride = require('method-override'); //used to manipulate POST
var common = new require("../utils/commonutils");
router.use(bodyParser.urlencoded({extended: true}))
router.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method
        delete req.body._method
        return method
    }
}))

router.param('id', function (req, res, next, id) {
    Article.findById(id, function (err, entity) {
        if (err || !entity) {
            res.status(404)
            var err = new Error('没有找到主题', id);
            err.status = 404;
            res.format({
                json: function () {
                    res.json(
                        {
                            status: err.status,
                            message: err
                        }
                    );
                }
            });
            //if it is found we continue on
        } else {
            //uncomment this next line if you want to see every JSON document response for every GET/PUT/DELETE call
            //console.log(blob);
            // once validation is done save the new item in the req
            req.id = id;
            req.article = entity;
            // go to the next thing
            next();
        }
    });
});


/**
 * 新增文章
 */
router.post('/', function (req, res, next) {
    var ep = new eventproxy();
    ep.fail(next);
    ep.on(pro_error, function (msg) {
        res.status(400).json({
            status: 40003,
            msg: msg,
        })
    });
    var data = {};
    if (req.body.title) {
        data.title = validator.trim(req.body.title);
    }
    if (req.body.content) {
        data.content = validator.trim(req.body.content);
    }
    if (req.body.author) {
        data.author = validator.trim(req.body.author);
    }
    if (req.body.authorId) {
        data.authorId = validator.trim(req.body.authorId);
    }

    if (req.body.site) {
        data.site = validator.trim(req.body.site);
    }
    if (req.body.siteId) {
        data.siteId = validator.trim(req.body.siteId);
    }
    if (req.body.srcUrl) {
        data.srcUrl = validator.trim(req.body.srcUrl);
    }
    if (req.body.topics) {
        data.topics = validator.trim(req.body.topics);
        data.topics = data.topics.split(",")
    }

    if (req.body.age) {
        data.age = validator.trim(req.body.age);
    }

    if (req.body.heartCount) {
        data.heartCount = validator.trim(req.body.heartCount);
    } else {
        data.heartCount = 0;
    }

    if (req.body.readCount) {
        data.readCount = validator.trim(req.body.readCount);
    } else {
        data.readCount = 0;
    }

    if (req.body.collectCount) {
        data.collectCount = validator.trim(req.body.collectCount);
    } else {
        data.collectCount = 0;
    }

    if (req.body.shareCount) {
        data.shareCount = validator.trim(req.body.shareCount);
    } else {
        data.shareCount = 0;
    }

    if (req.body.publishAt) {
        data.publishAt = validator.trim(req.body.publishAt);
    }
    data.createAt = new Date().getTime();
    data.updateAt = new Date().getTime();
    if(data.content.length < 25){
        return res.json({
            status:200,
            msg:"fail"
        })
    }
    Article.create(data, function (err, entity) {
        if (err) {
            if (err.code == 11000) {
                ep.emit(pro_error, '文章已经存在');
                return;
            } else {
                ep.emit(pro_error, err.message);
                return;
            }
        } else {
            Site.update({"_id": data.siteId}, {"$inc": {"articleCount": 1}}).exec();
            Topic.update({"name": common.getTopic(data.topics)}, {"$inc": {"articleCount": 1}}).exec();
            res.format({
                //HTML response will set the location and redirect back to the home page. You could also create a 'success' page if that's your thing
                //html: function(){
                //  // If it worked, set the header so the address bar doesn't still say /adduser
                //  res.location("blobs");
                //  // And forward to success page
                //  res.redirect("/blobs");
                //},
                //JSON response will show the newly created blob
                json: function () {
                    res.json({
                        status: 200,
                        data: req.article
                    });
                }
            });
        }
    })
});


/**
 * 热门文章
 *
 */
router.post('/hot', function (req, res) {
    console.log("get hot articles")
    var pageSize = req.query.pageSize > 0 ? req.query.pageSize : 5;
    var topic = req.query.topic;
    var siteId = req.query.siteId;
    var data = {};
    if (siteId) {
        data.siteId = validator.trim(siteId);
    }
    if (topic) {
        data.topics = validator.trim(topic);
    }
    var page = 1;
    console.log("page:" + page)
    var query = Article.find(data);
    query.skip((page - 1) * pageSize);
    query.limit(pageSize * 1);
    query.sort({'heartCount': -1})
    var sels = 'title publishAt author authorId site siteId srcUrl ' +
        'topics age heartCount readCount collectCount shareCount commentCount createAt updateAt checked reason isBlock';
    query.select(sels)
    query.exec(function (err, entity) {
        if (err) {
            res.format({
                json: function () {
                    res.json({
                        status: 500,
                        msg: err.message
                    });
                }
            });
        } else {
            res.format({
                json: function () {
                    res.status(200).json({
                        "status": 200,
                        "data": entity
                    });
                }
            });
        }
    });
});

router.get('/:id', function (req, res, next) {
    var ep = new eventproxy();
    ep.fail(next);
    ep.on(pro_error, function (msg) {
        res.status(400).json({
            status: 40003,
            msg: msg,
        })
    });
    var data = {
        'article': req.article,
        "topic": common.getTopic(req.article.topics),
    }
    ep.on("success", function () {
        res.format({
            html: function(){
                res.render('article', data);
            },
            json: function () {
                res.json({
                    status: 200,
                    data: data,
                });
            }
        });
    });

    var uid = req.query.uid;
    User2Article.findOne({"userId": uid, "articleId": req.id}, function (err, entity) {
        console.log("User2ArticleCollect entity:" + entity);
        if (entity) {
            data.user2article = entity;
        }
        ep.emit("success");
    });
    Article.update({"_id": req.id}, {"$inc": {"readCount": 1}}).exec();
    if (uid) {
        User.update({'_id': uid}, {'$inc': {'readCount': 1}}).exec();
        User2Article.findOne({"userId": uid, "articleId": req.id}, function (err, entity) {
            console.log("add read article");
            if (!entity) {
                var data = {"userId": uid, "articleId": req.id, "articleName": req.article.title};
                if (req.body.userAvatar) {
                    data.userAvatar = validator.trim(req.body.userAvatar);
                }
                data.siteName = req.article.siteName;
                data.siteId = req.article.siteId;
                data.read = true;
                var read = new User2Article(data);
                read.save();
            }
        });

    }
});

module.exports = router;
