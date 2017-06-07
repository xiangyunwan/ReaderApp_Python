var supertest = require('supertest');
var app = require('../../app');
var request = supertest(app);
var should = require("should");

describe("test topics", function () {
    it("user login", function (done) {
        request.post('/users/login')
            .send({
                name: 'wizardholy',
                loginname: '18301441595',
                passwd: '301415mly',
            })
            .expect(200, function (err, res) {
                console.log(" data:"+res.body);
                done(err);
            });
    })
})