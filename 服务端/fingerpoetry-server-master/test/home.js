var supertest = require('supertest');
var app = require('../app');
var request = supertest(app);
var should = require("should");

describe("test home", function () {
    it("should / status 200", function (done) {
        // request.get("/").end(function(err, res){
        //     console.log(res.body)
        //     res.status.should.equal(230);
        //     done()
        // })
        request.get('/')
            .expect('Content-Type', 'text/html; charset=utf-8')
            .expect(200)
            .end(function(err, res){
                if (err) throw err;
                done();
            });
    })
})