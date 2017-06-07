var express = require('express');
var mongoose = require('mongoose');

var router = express.Router();
var bodyParser = require('body-parser'); // parses information from POST
var methodOverride = require('method-override'); //used to manipulate POST
//Any requests to this controller must pass through this 'use' function
//Copy and pasted from method-override
router.use(bodyParser.urlencoded({ extended: true }))
router.use(methodOverride(function(req, res){
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    var method = req.body._method
    delete req.body._method
    return method
  }
}))
/**
 * 获取所有的欢迎图片
 */
router.get('/', function(req, res, next) {
  var conditions = {};
  var updateAt = req.query.updateAt;
  var type = req.query.type;
  var date = new Date();
  if (updateAt !== undefined && updateAt == '') {
    var date = new Date(updateAt);
  }
  if (type !== undefined && type == '') {

  }

  mongoose.model('Splash').findOne(conditions, function (err, splashes) {
    if (err) {
      return console.error(err);
    } else {
      ////respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header
      //res.format({
      //  //HTML response will render the index.jade file in the views/blobs folder. We are also setting "blobs" to be an accessible variable in our jade view
      //  html: function(){
      //    res.render('blobs/index', {
      //      title: 'All my Blobs',
      //      "blobs" : blobs
      //    });
      //  },
      //  //JSON response will show all blobs in JSON format
      //  json: function(){
      res.json(splashes);
      //  }
      //});
    }
  });
});

router.post('/', function(req, res, next) {
  // Get values from POST request. These can be done through forms or REST calls. These rely on the "name" attributes for forms
  var width = req.body.width;
  var height = req.body.height;
  var url = req.body.url;
  //call the create function for our database
  console.log(width+":"+height+":"+url);
  mongoose.model('Splash').create({
    width : width,
    height : height,
    url : url,
    createAt: Date.now(),
    updateAt: Date.now(),
  }, function (err, splash) {
    if (err) {
      console.log(err);
      res.status(403).json(
          {
            status:40301,
            message:err.message
          }
      );
    } else {
      console.log('POST creating new splash: ' + splash);
      res.format({
        //HTML response will set the location and redirect back to the home page. You could also create a 'success' page if that's your thing
        //html: function(){
        //  // If it worked, set the header so the address bar doesn't still say /adduser
        //  res.location("blobs");
        //  // And forward to success page
        //  res.redirect("/blobs");
        //},
        //JSON response will show the newly created blob
        json: function(){
          res.json(splash);
        }
      });
    }
  })
});

// route middleware to validate :id
router.param('id', function(req, res, next, id) {
  mongoose.model('Splash').findById(id, function (err, splash) {
    console.log("find splash by id:"+id+" result:"+splash);
    if (err || !splash ) {
      console.log(id + ' was not found');
      res.status(404)
      var err = new Error('Not Found');
      err.status = 404;
      res.format({
        //html: function(){
        //  next(err);
        //},
        json: function(){
          res.json(
            {
              status: err.status,
              message : err
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
      // go to the next thing
      next();
    }
  });
});

router.get('/:id', function(req, res) {
  mongoose.model('Splash').findById(req.id, function (err, splash) {
    if (err) {
      console.log('GET Error: There was a problem retrieving: ' + err);
    } else {
      console.log('GET Retrieving ID: ' + req.id + "result:"+splash);
      res.format({
        //html: function(){
        //  res.render('blobs/show', {
        //    "blobdob" : blobdob,
        //    "blob" : blob
        //  });
        //},
        json: function(){
          res.json(splash);
        }
      });
    }
  });
});

router.put('/:id', function(req, res) {
  // Get values from POST request. These can be done through forms or REST calls. These rely on the "name" attributes for forms
  var width = req.body.width;
  var height = req.body.height;
  var url = req.body.url;
  var data = {};
  if(width != undefined && width != null){
    data.width = width;
  }
  if(height != undefined && height != null){
    data.height = height;
  }
  if(url != undefined && url != null){
    data.url = url;
  }
  //find the document by ID
  mongoose.model('Splash').findById(req.id, function (err, splash) {
    //update it
    splash.update(data, function (err, blobID) {
      if (err) {
        res.send("There was a problem updating the information to the database: " + err);
      }
      else {
        //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
        res.format({
          //html: function(){
          //  res.redirect("/blobs/" + blob._id);
          //},
          //JSON responds showing the updated values
          json: function(){
            res.json({result:200});
          }
        });
      }
    })
  });
})

/**
 * delete splash
 */
router.delete('/:id', function(req, res) {
  mongoose.model('Splash').findById(req.id, function (err, splash) {
    if (err) {
      return console.error(err);
    } else {
      //remove it from Mongo
      splash.remove(function (err, splash) {
        if (err) {
          return console.error(err);
        } else {
          //Returning success messages saying it was deleted
          console.log('DELETE removing ID: ' + splash._id);
          res.format({
            //HTML returns us back to the main page, or you can create a success page
            //html: function(){
            //  res.redirect("/blobs");
            //},
            //JSON returns the item with the message that is has been deleted
            json: function(){
              res.json({message : 'deleted',
                item : splash
              });
            }
          });
        }
      });
    }
  });
});

module.exports = router;
