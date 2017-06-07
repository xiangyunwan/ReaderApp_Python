var express = require('express');
var mongoose = require('mongoose');
var validator = require('validator');
var eventproxy = require('eventproxy');
var pro_error = "prop_error";
var unfind = "unfind";
var bodyParser = require('body-parser'); // parses information from POST
var methodOverride = require('method-override'); //used to manipulate POST

var Topic = mongoose.model('Topic');
var User2Topic = mongoose.model('User2Topic');
var Article = mongoose.model('Article');
var User = mongoose.model('User');

var DEFAULT_PAGE_SIZE = 20; // 默认每页数量
var DEFAULT_PAGE = 1; // 默认页号
var router = express.Router();

var validateToken = require("../utils/authutil").validateToken;
var requireAuth = require("../utils/authutil").requireAuth;
var validateRole = require("../utils/authutil").validateRole;

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
 * 获取所有的主题
 */
router.get('/',
    function (req, res) {
        console.log("get all topics");
        var pageSize = req.param('pageSize') > 0 ? req.param('pageSize') : 1024;
        var page = req.param('page') > 0 ? req.param('page') : DEFAULT_PAGE;
        var beforeAt = req.param('beforeAt');
        var afterAt = req.param('afterAt');
        var conditions = {isBlock: false};
        var query = Topic.find(conditions);
        if (beforeAt > 0 && afterAt > 0 && beforeAt > afterAt) {
            query.where("updateAt").gt(afterAt).lt(beforeAt);
        } else if (beforeAt > 0) {
            query.where("updateAt").lt(beforeAt);
        } else if (afterAt > 0) {
            query.where("updateAt").gt(afterAt);
        } else {
            query.where("updateAt").lt(new Date().getTime());
        }
        query.skip((page - 1) * pageSize);
        query.limit(pageSize * 1);
        query.sort({'followerCount': -1, "articleCount": -1});
        query.exec(function (err, entities) {
            if (err) {
                res.status(400).json({
                    status: 40001,
                    msg: err.message,
                })
            } else {
                ////respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header
                res.format({
                    //  //HTML response will render the index.jade file in the views/blobs folder. We are also setting "blobs" to be an accessible variable in our jade view
                    //  html: function(){
                    //    res.render('blobs/index', {
                    //      title: 'All my Blobs',
                    //      "blobs" : blobs
                    //    });
                    //  },
                    //JSON response will show all blobs in JSON format
                    json: function () {
                        res.status(200).json({
                            status: 200,
                            data: entities
                        });
                    }
                });
            }
        });
    });

router.post('/',
    validateToken,
    requireAuth,
    validateRole,
    function (req, res, next) {
        // Get values from POST request. These can be done through forms or REST calls. These rely on the "name" attributes for forms
        var ep = new eventproxy();
        ep.fail(next);
        ep.on(pro_error, function (msg) {
            res.status(400).json({
                status: 40001,
                msg: msg,
            })
        });
        var data = {};
        if (req.body.name) {
            data.name = validator.trim(req.body.name);
        }

        if (req.body.followerCount) {
            data.followerCount = validator.trim(req.body.followerCount);
        }
        Topic.create(data, function (err, entity) {
            if (err) {
                if (err.code == 11000) {
                    ep.emit(pro_error, '主题已经存在。');
                    return;
                } else {
                    ep.emit(pro_error, err.message);
                    return;
                }
            } else {
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
                            data: entity
                        });
                    }
                });
            }
        })
    });

// route middleware to validate :id
router.param('id', function (req, res, next, id) {
    Topic.findById(id, function (err, entity) {
        if (err || !entity) {
            // res.status(404)
            // var err = new Error('没有找到主题', id);
            // err.status = 404;
            // res.format({
            //     //html: function(){
            //     //  next(err);
            //     //},
            //     json: function () {
            //         res.json(
            //             {
            //                 status: err.status,
            //                 message: err
            //             }
            //         );
            //     }
            // });
            next()
            //if it is found we continue on
        } else {
            //uncomment this next line if you want to see every JSON document response for every GET/PUT/DELETE call
            //console.log(blob);
            // once validation is done save the new item in the req
            req.id = id;
            req.topic = entity;
            // go to the next thing
            next();
        }
    });
});

router.get('/:id', function (req, res, next) {
    if (req.article) {
        res.format({
            //html: function(){
            //  res.render('blobs/show', {
            //    "blobdob" : blobdob,
            //    "blob" : blob
            //  });
            //},
            json: function () {
                res.json({
                    status: 200,
                    data: req.topic
                });
            }
        });
    } else {
        if (req.params.id == 'hot') {
            next()
        } else {
            res.status(404)
            res.format({
                json: function () {
                    res.json(
                        {
                            status: 404,
                            message: "没有找到主题"
                        }
                    );
                }
            });
        }
    }
});

/**
 * 热门频道
 *
 */
router.get('/hot', function (req, res) {
    var pageSize = req.query.pageSize > 0 ? req.query.pageSize : 5;

    var data = {};
    data["name"] = {"$nin": ["热门", "推荐"]}
    var query = Topic.find(data);
    query.limit(pageSize * 1);
    query.sort({'articleCount': -1})
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


router.put('/:id',
    validateToken,
    requireAuth,
    validateRole,
    function (req, res, next) {
        var ep = new eventproxy();
        ep.fail(next);
        ep.on(pro_error, function (msg) {
            res.status(400).json({
                status: 40001,
                msg: msg,
            })
        });
        var data = {};
        if (req.body.name) {
            data.name = validator.trim(req.body.name);
        }

        if (req.body.articleCount) {
            data.articleCount = validator.trim(req.body.articleCount);
        }

        if (req.body.followerCount) {
            data.followerCount = validator.trim(req.body.followerCount);
        }

        var entity = req.topic;
        //update it
        if (req.body.name) {
            entity.name = data.name;
        }

        if (req.body.articleCount) {
            entity.articleCount = data.articleCount;
        }

        if (req.body.followerCount) {
            entity.followerCount = data.followerCount;
        }

        entity.updateAt = new Date().getTime();
        data.updateAt = entity.updateAt;
        entity.update(data, function (err, blobID) {
            if (err) {
                var msg = err.message;
                if (err.code == 11000) {
                    msg = "名字已经存在";
                }
                res.status(400).json({
                    status: 400,
                    msg: msg,
                })
                return;
            } else {
                //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
                res.format({
                    //html: function(){
                    //  res.redirect("/blobs/" + blob._id);
                    //},
                    //JSON responds showing the updated values
                    json: function () {
                        res.json({
                            status: 200,
                            data: entity
                        });
                    }
                });
                if (req.body.name) {
                    User2Topic.update(
                        {topicId: entity._id},
                        {topicName: entity.name},
                        {multi: true},
                        function (err, numberAffected, raw) {
                        }
                    );
                }
            }
        })
    })

/**
 * 支持分页查询
 */
router.get('/:id/articles', function (req, res) {
    var pageSize = req.query.pageSize > 0 ? req.query.pageSize : DEFAULT_PAGE_SIZE;
    var page = req.query.page > 0 ? req.query.page : DEFAULT_PAGE;
    var beforeAt = req.query.beforAt;
    var afterAt = req.query.afterAt;
    console.log("pageSize:" + pageSize + " page:" + page + " beforeAt:" + beforeAt + " afterAt:" + afterAt);

    var conditions = {topics: [req.topic.name]};
    var query = Article.find(conditions);
    if (beforeAt > 0 && afterAt > 0 && beforeAt > afterAt) {
        query.where("updateAt").gt(afterAt).lt(beforeAt);
    } else if (beforeAt > 0) {
        query.where("updateAt").lt(beforeAt);
    } else if (afterAt > 0) {
        query.where("updateAt").gt(afterAt);
    } else {
        query.where("updateAt").lt(new Date().getTime());
    }
    query.select('title publishAt author authorId site siteId srcUrl ' +
        'topics age likeNum commentNum readNum createAt updateAt checked reason isBlock')
    query.skip((page - 1) * pageSize);
    query.limit(pageSize * 1);
    query.sort('-updateAt desc');
    query.exec(function (err, entity) {
        if (err) {
            return next();
        } else {
            res.format({
                //html: function(){
                //  res.render('blobs/show', {
                //    "blobdob" : blobdob,
                //    "blob" : blob
                //  });
                //},
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

/**
 * delete entity
 */
router.delete('/:id',
    validateToken,
    requireAuth,
    validateRole, function (req, res) {
        var entity = req.topic;
        entity.isBlock = true;
        entity.updateAt = new Date().getTime();
        entity.update({isBlock: true, updateAt: entity.updateAt}, function (err, data) {
            if (err) {
                return console.error(err);
            } else {
                //Returning success messages saying it was deleted
                res.format({
                    //HTML returns us back to the main page, or you can create a success page
                    //html: function(){
                    //  res.redirect("/blobs");
                    //},
                    //JSON returns the item with the message that is has been deleted
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

/**
 * undelete entity
 */
router.post('/:id/undelete',
    validateToken,
    requireAuth,
    validateRole, function (req, res) {
        var entity = req.topic;
        if (err) {
            return console.error(err);
        } else {
            entity.isBlock = false;
            entity.updateAt = new Date().getTime();
            entity.update({isBlock: entity.isBlock, updateAt: entity.updateAt}, function (err, data) {
                if (err) {
                    return console.error(err);
                } else {
                    res.format({
                        //HTML returns us back to the main page, or you can create a success page
                        //html: function(){
                        //  res.redirect("/blobs");
                        //},
                        //JSON returns the item with the message that is has been deleted
                        json: function () {
                            res.json({
                                status: 200,
                                data: entity
                            });
                        }
                    });
                }
            });
        }
    });
/**
 * subscribe entity
 */
router.post('/:id/subscribe',
    validateToken,
    requireAuth, function (req, res) {
        var topic = req.topic;
        var user = req.user;
        var conditions = {};
        conditions.userId = user._id;
        conditions.topicId = topic._id;
        User2Topic.findOne(conditions, function (err, entity) {
            if (err) {
                return next();
            }
            var data = {};
            if (entity) {
                if (entity.isBlock) {
                    data.isBlock = false;
                    entity.isBlock = false;
                    data.seq = req.body.seq ? req.body.seq : 0;
                    entity.seq = data.seq;
                    entity.updateAt = new Date().getTime();
                    entity.update(data, function (err, resData) {
                        if (err) {
                            res.status(500).json(
                                {
                                    status: 500,
                                    message: err.message
                                }
                            );
                        } else {
                            res.format({
                                //HTML response will set the location and redirect back to the home page. You could also create a 'success' page if that's your thing
                                //html: function(){
                                //  // If it worked, set the header so the address bar doesn't still say /adduser
                                //  res.location("blobs");
                                //  // And forward to success page
                                //  res.redirect("/blobs");
                                //},
                                json: function () {
                                    res.json({
                                        status: 200,
                                        data: entity
                                    });
                                }
                            });

                            topic.update({followerCount: topic.followerCount + 1}, function (err, data) {
                            });
                            user.update({followingTopic: user.followingTopic + 1}, function (err, data) {
                            });
                        }
                    })
                } else {
                    res.format({
                        //HTML response will set the location and redirect back to the home page. You could also create a 'success' page if that's your thing
                        //html: function(){
                        //  // If it worked, set the header so the address bar doesn't still say /adduser
                        //  res.location("blobs");
                        //  // And forward to success page
                        //  res.redirect("/blobs");
                        //},
                        json: function () {
                            res.json({
                                status: 200,
                                data: entity
                            });
                        }
                    });
                }
            } else {
                data.userId = user._id;
                data.userAvatar = user.avatar;
                data.topicId = topic._id;
                data.topicName = topic.name;
                data.seq = req.param('seq') ? req.param("seq") : 0;
                User2Topic.create(data, function (err, entity) {
                    if (err) {
                        res.status(500).json(
                            {
                                status: 500,
                                message: err.message
                            }
                        );
                    } else {
                        res.format({
                            //HTML response will set the location and redirect back to the home page. You could also create a 'success' page if that's your thing
                            //html: function(){
                            //  // If it worked, set the header so the address bar doesn't still say /adduser
                            //  res.location("blobs");
                            //  // And forward to success page
                            //  res.redirect("/blobs");
                            //},
                            json: function () {
                                res.json({
                                    status: 200,
                                    data: entity
                                });
                            }
                        });
                        topic.update({followerCount: topic.followerCount + 1}, function (err, data) {
                        });
                        user.update({followingTopic: user.followingTopic + 1}, function (err, data) {
                        });
                    }
                })
            }
        })
    });


/**
 * subscribe entity
 */
router.put('/:id/subscribe',
    validateToken,
    requireAuth, function (req, res, next) {
        var topic = req.topic;
        var user = req.user;
        var conditions = {};
        conditions.userId = user._id;
        conditions.topicId = topic._id;
        var ep = new eventproxy();
        ep.fail(next);
        ep.on(pro_error, function (msg) {
            res.status(400).json({
                status: 400,
                msg: msg,
            })
        });
        ep.on(unfind, function (msg) {
            res.status(404).json({
                status: 404,
                msg: msg,
            })
        });

        User2Topic.findOne(conditions, function (err, entity) {
            if (err) {
                return next();
            }
            var data = {};

            if (entity) {
                if (!entity.isBlock) {
                    data.seq = req.body.seq ? req.body.seq : 0;
                    entity.seq = data.seq;
                    entity.updateAt = new Date().getTime();
                    entity.update(data, function (err, resData) {
                        if (err) {
                            ep.emit(pro_error, '数据更新异常');
                            return;
                        } else {
                            res.format({
                                //HTML response will set the location and redirect back to the home page. You could also create a 'success' page if that's your thing
                                //html: function(){
                                //  // If it worked, set the header so the address bar doesn't still say /adduser
                                //  res.location("blobs");
                                //  // And forward to success page
                                //  res.redirect("/blobs");
                                //},
                                json: function () {
                                    res.json({
                                        status: 200,
                                        data: entity
                                    });
                                }
                            });
                        }
                    })
                } else {
                    ep.emit(pro_error, '未订阅该主题');
                    return;
                }
            } else {
                ep.emit(unfind, '没有订阅的主题');
                return;
            }
        })
    });

/**
 * undelete entity
 */
router.post('/:id/unsubscribe',
    validateToken,
    requireAuth, function (req, res) {
        var topic = req.topic;
        var user = req.user;
        var conditions = {};
        conditions.userId = user._id;
        conditions.topicId = topic._id;
        User2Topic.findOne(conditions, function (err, entity) {
            if (err) {
                res.status(500).json(
                    {
                        status: 500,
                        message: err.message
                    }
                );
                return;
            }
            var data = {};
            if (entity) {
                if (!entity.isBlock) {
                    data.isBlock = true;
                    entity.isBlock = true;
                    entity.update(data, function (err, resData) {
                        if (err) {
                            res.status(500).json(
                                {
                                    status: 500,
                                    message: err.message
                                }
                            );
                        } else {
                            res.format({
                                //HTML response will set the location and redirect back to the home page. You could also create a 'success' page if that's your thing
                                //html: function(){
                                //  // If it worked, set the header so the address bar doesn't still say /adduser
                                //  res.location("blobs");
                                //  // And forward to success page
                                //  res.redirect("/blobs");
                                //},
                                json: function () {
                                    res.json({
                                        status: 200,
                                        data: entity
                                    });
                                }
                            });
                            topic.update({followerCount: topic.followerCount - 1}, function (err, data) {
                            });
                            user.update({followingTopic: user.followingTopic - 1}, function (err, data) {
                            });
                        }
                    })
                } else {
                    res.format({
                        //HTML response will set the location and redirect back to the home page. You could also create a 'success' page if that's your thing
                        //html: function(){
                        //  // If it worked, set the header so the address bar doesn't still say /adduser
                        //  res.location("blobs");
                        //  // And forward to success page
                        //  res.redirect("/blobs");
                        //},
                        json: function () {
                            res.json({
                                status: 200,
                                data: entity
                            });
                        }
                    });
                }
            } else {
                res.status(404).json(
                    {
                        status: 404,
                        message: "没有找到该记录"
                    }
                );
                return;
            }
        });
    });

module.exports = router;
