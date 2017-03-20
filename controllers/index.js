module.exports = function(app, co) {
    var rp = require('request-promise'),
        fs = require('fs'),
        md5Crypto = require('crypto-js/md5'),
        _ = require('lodash');

    /**
   * 测试 pms module product 获取,
   */
    app.route('/aaa').get(function(req, res, next) {
        co(function * () {

            try {
                console.log(22)
                res.json({status: 200, message: null, data: null, err: null});
            } catch (e) {
                console.log(e)
            }
        });
    });

};
