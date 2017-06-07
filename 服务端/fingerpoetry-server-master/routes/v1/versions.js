var express = require('express');
var mongoose = require('mongoose');
var validator = require('validator');
var eventproxy = require('eventproxy');
var bodyParser = require('body-parser'); // parses information from POST
var methodOverride = require('method-override'); //used to manipulate POST
var Version = mongoose.model('Version');
var router = express.Router();

var validateToken = require("../../utils/authutil").validateToken;
var requireAuth = require("../../utils/authutil").requireAuth;
var validateRole = require("../../utils/authutil").validateRole;
var pro_error = "prop_error";
var unfind = "unfind";
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
 * 获取所有的站点
 */
router.get('/',
    function (req, res) {
        console.log("get all version");
        var conditions = {isBlock: false};
        if (req.query.type) {
            conditions.type = validator.trim(req.query.type);
        }
        var query = Version.find(conditions);
        query.sort({"updateAt": -1})
            .exec(function (err, entities) {
                if (err) {
                    return console.error(err);
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
                            res.json({
                                status: 200,
                                data: entities[0]
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
        var ep = new eventproxy();
        ep.fail(next);
        ep.on(pro_error, function (msg) {
            res.status(400).json({
                status: 40001,
                msg: msg,
            })
        });
        var data = {};
        if (req.body.content) {
            data.content = validator.trim(req.body.content);
        }

        if (req.body.type) {
            data.type = validator.trim(req.body.type);
        }

        if (req.body.version) {
            data.version = validator.trim(req.body.version);
        }

        if (req.body.url) {
            data.url = validator.trim(req.body.url);
        }
        
        if ([data.content, data.type, data.url, data.version].some(function (item) {
                console.log("some:"+item);
                return item === '' || item == undefined;
            })) {
            ep.emit(pro_error, "信息不完全");
            return;
        }

        Version.create(data, function (err, entity) {
            if (err) {
                if (err.code == 11000) {
                    ep.emit(pro_error, '插入版本数据重复');
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

router.put('/:type',
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
        if (req.body.content) {
            data.content = validator.trim(req.body.content);
        }

        if (req.body.url) {
            data.url = validator.trim(req.body.url);
        }

        if (req.body.version) {
            data.version = validator.trim(req.body.version);
        }
        if ([data.content, data.version, data.url].some(function (item) {
                console.log("some:"+item);
                return item === '' || item == undefined;
            })) {
            ep.emit(pro_error, "信息不完全");
            return;
        }
        Version.update({"type":req.params.type}, data, function (err, blobID) {
            if (err) {
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
                        });
                    }
                });
            }
        })
    })

module.exports = router;
