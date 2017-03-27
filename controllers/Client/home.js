var co = require('co'),
  moment = require('moment'),
  fs = require('fs'),
  path = require('path'),
  mkdirs = require('mkdirs'),
  md5Crypto = require('crypto-js/md5'),
  rp = require('request-promise');

/**
 * @routePrefix('/client/home/')
 */
module.exports = HomeController = {
  /**
   * 登录表单
   * @route('login', 'POST')
   * @param req
   * @param res
   * @constructor
   */
  USER_LOGIN: function (req, res) {
    co(function* () {
        if(req.body.username === req.body.password) {
              F.renderSuccessJson(res, req.body.username + " 登录成功" , req.body);
        }else{
              F.renderErrorJson(res, "登录失败！请确认用户名和密码", req.body);
        }


    }).catch(F.handleErr.bind(null, res))
  },

};
