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


  /**
   * 用户列表
   * @route('list', 'GET')
   * @param req
   * @param res
   * @constructor
   */
  USER_LIST: function (req, res) {
    co(function* () {
      var $count  = req.query.$count || true
      var $offset = req.query.$offset || 0;
      var $limit = req.query.$limit || 0;
      var $filter = req.query.$filter || '';
      var condition = {}
      if($filter){
        condition['$and'] = [{ '$or': [{ 'user_name': new RegExp($filter, "i") }, { 'user_id': $filter }] }];
      }
      var count = yield M.user.count(condition);
      var items =  yield M.user.find(condition,'-_id', {limit: +$limit,skip: +$offset})
      var newItems  = []
      if(items && items.length >= 0){
        for(var item of items){
                  var userRole = yield M.user_role.findOne({
                          user_id: item.user_id
                     })
                  item._doc['user_role'] = userRole.role_id
                  newItems.push(item)
          }
      }
     var allRole = yield M.role.find();
     var resObj = {}
     resObj.count = count;
     resObj.items = newItems
     resObj.allRole = allRole;
     if(resObj){
              F.renderSuccessJson( res, req, "获取成功",resObj);
        }else{
              F.renderErrorJson( res, req, "获取失败！请确认参数");
        }

    }).catch(F.handleErr.bind(null, res))
  },
  /**
   * 用户ADD操作
   * @route('opt', 'POST')
   * @param req
   * @param res
   * @constructor
   */
  USER_ADD: function (req, res) {
    co(function* () {
    var body = req.body;
    if(body){
        var isHaveUser = yield M.user.findOne({
          user_id: body.user_id
        })
        if(isHaveUser){
            F.renderErrorJson( res, req, "已存在相同ID: " + body.user_id);
        }else{
           var resBody = yield M.user.create(body)
           yield M.user_role.create({
              role_id: body.role_id,
              user_id: body.user_id
           })
           F.renderSuccessJson( res, req, "操作成功",resBody);
        }
    }

    }).catch(F.handleErr.bind(null, res))
  },
  /**
   * 用户 删除操作
   * @route('opt', 'DELETE')
   * @param req
   * @param res
   * @constructor
   */
   USER_DELETE: function (req, res) {
     co(function* () {

     var body = req.body;
     if(body){
         var isHaveUser = yield M.user.findOne({
           user_id: body.user_id
         })
         if(isHaveUser){
           var resBody = yield M.user.remove({ user_id:isHaveUser.user_id});
           yield M.user_role.remove({
              user_id:isHaveUser.user_id
           })
           F.renderSuccessJson( res, req, "操作成功",resBody);
         }else{
            F.renderErrorJson( res, req, "操作失败" + 'ID' +body.user_id+'用户不存在','ID' +body.user_id+'用户不存在' );
         }
     }

     }).catch(F.handleErr.bind(null, res))
   },

  /**
   * 用户修改操作
   * @route('opt', 'PUT')
   * @param req
   * @param res
   * @constructor
   */
   USER_UPDATE: function (req, res) {
     co(function* () {
     var body = req.body;
     if(body){
         var isHaveUser = yield M.user.findOne({
           user_id: body.user_id
         })
         if(isHaveUser){
            var resBody = yield M.user.update({ user_id:isHaveUser.user_id},body,{multi:false});
            yield M.user_role.update({ user_id:isHaveUser.user_id},{
              role_id: body.role_id, user_id: body.user_id},{multi:false});
            F.renderSuccessJson( res, req, "操作成功",resBody);
         }else{
            F.renderErrorJson( res, req, "操作失败" +  'ID' +body.user_id+'用户不存在','ID' +body.user_id+'用户不存在' );
         }
     }

     }).catch(F.handleErr.bind(null, res))
   },
  /**
   * 批量添加测试数据
   * @route('testAdd', 'get')
   * @param req
   * @param res
   * @constructor
   */
  USER_TESTADD: function (req, res) {
    co(function* () {
      for (var i = 0; i < 1000; i++) {
        var userInfo = yield M.user.create({
          user_id: i + '',
          password:  i + '',
          user_name:  '测试名字' + i,
        })
        var userRoleInfo = yield M.user_role.create({
          user_id: i + '',
          role_id: parseInt(Math.random()*3 +1)
        })
     }

      F.renderErrorJson( res, req, "登录失败！请确认用户名和密码");
    }).catch(F.handleErr.bind(null, res))
  },
};
