var co = require('co'),
  moment = require('moment'),
  fs = require('fs'),
  path = require('path'),
  mkdirs = require('mkdirs'),
  md5Crypto = require('crypto-js/md5'),
  rp = require('request-promise');

/**
 * @routePrefix('/user/')
 */
module.exports = UserController = {
  /**
   * 登录表单
   * @route('login', 'POST')
   * @param req
   * @param res
   * @constructor
   */
  USER_LOGIN: function (req, res) {
    co(function* () {
      var username = req.body.username|| '';
      var password = req.body.password || '';
      var userInfo = yield M.user.findOne({
        user_id: username.trim(),
        password: password.trim(),
      })

      //判断是否库里有值
      if(userInfo) {
         var resObj = {}
         var user_role = yield M.user_role.findOne({
              user_id: userInfo.user_id
           })
         if(user_role){
            var role =  yield M.role.findOne({
               role_id: user_role.role_id
           })
            if(role){
              var s = [];
              s.push(role);
              resObj.role = s
              resObj.user = userInfo
            }
         }
         F.renderSuccessJson( res, req, "登录成功",resObj);
        }else{
              F.renderErrorJson( res, req, "登录失败！请确认用户名和密码");
        }

    }).catch(F.handleErr.bind(null, res))
  },

};
