var co = require('co'),
  moment = require('moment'),
  fs = require('fs'),
  path = require('path'),
  mkdirs = require('mkdirs'),
  md5Crypto = require('crypto-js/md5'),
  rp = require('request-promise');


/**
 * @routePrefix('/putin/')
 */
module.exports = PutinController = {

  /**
   * 入库列表
   * @route('list', 'GET')
   * @param req
   * @param res
   * @constructor
   */
  PUTIN_LIST: function (req, res) {
    co(function* () {
      var $count  = req.query.$count || true
      var $offset = req.query.$offset || 0;
      var $limit = req.query.$limit || 0;
      var $filter = req.query.$filter || '';
      var condition = {}
      if($filter){
        condition['$and'] = [{ '$or': [{ 'putin_goods_name': new RegExp($filter, "i") }, { 'putin_goods_id': $filter }] }];
      }
      var count = yield M.putin.count(condition);
      var items =  yield M.putin.find(condition, null , {limit: +$limit,skip: +$offset})
      var newItems  = []
      if(items && items.length >= 0){
        for(var item of items){
                  // var putinRole = yield M.putin.findOne({
                  //         _id: item._id
                  //    })
                  // item._doc['putin'] = putinRole.role_id
                  newItems.push(item)
          }
      }
     var resObj = {}
     resObj.count = count;
     resObj.items = newItems
     if(resObj){
              F.renderSuccessJson( res, req, "获取成功",resObj);
        }else{
              F.renderErrorJson( res, req, "获取失败！请确认参数");
        }

    }).catch(F.handleErr.bind(null, res))
  },
  /**
   * 入库ADD操作
   * @route('opt', 'POST')
   * @param req
   * @param res
   * @constructor
   */
  PUTIN_ADD: function (req, res) {
    co(function* () {
    var body = req.body;
    if(body){
           var resBody = yield M.putin.create(body)
           F.renderSuccessJson( res, req, "操作成功",resBody);
    }

    }).catch(F.handleErr.bind(null, res))
  },
  /**
   * 入库 删除操作
   * @route('opt', 'DELETE')
   * @param req
   * @param res
   * @constructor
   */
   PUTIN_DELETE: function (req, res) {
     co(function* () {
     var body = req.body;
     if(body){
         var isHavePutin = yield M.putin.findOne({
           _id: body._id
         })
         if(isHavePutin){
           var resBody = yield M.putin.remove({ _id:isHavePutin._id});
           F.renderSuccessJson( res, req, "操作成功",resBody);
         }else{
            F.renderErrorJson( res, req, "操作失败"  + body.putin_goods_name + '入库不存在' );
         }
     }

     }).catch(F.handleErr.bind(null, res))
   },

  /**
   * 入库修改操作
   * @route('opt', 'PUT')
   * @param req
   * @param res
   * @constructor
   */
   PUTIN_UPDATE: function (req, res) {
     co(function* () {
     var body = req.body;
     if(body){
         var isHavePutin = yield M.putin.findOne({
           _id: body._id
         })
         if(isHavePutin){
                var resBody = yield M.putin.update({ _id:isHavePutin._id},body,{multi:false});
                F.renderSuccessJson( res, req, "操作成功",resBody);
         }else{
            F.renderErrorJson( res, req, "操作失败" +  body.putin_goods_name +'入库不存在' );
         }
     }

     }).catch(F.handleErr.bind(null, res))
   },


  // /**
  //  * 批量添加测试数据
  //  * @route('testAdd', 'get')
  //  * @param req
  //  * @param res
  //  * @constructor
  //  */
  // PUTIN_TESTADD: function (req, res) {
  //   co(function* () {
  //     for (var i = 0; i < 1000; i++) {
  //       var putinInfo = yield M.putin.create({
  //         _id: i + '',
  //         putin_name:  '测试名字' + i,
  //       })
  //    }
  //
  //     F.renderErrorJson( res, req, "登录失败！请确认入库名和密码");
  //   }).catch(F.handleErr.bind(null, res))
  // },
};
