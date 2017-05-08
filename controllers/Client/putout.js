var co = require('co'),
  moment = require('moment'),
  fs = require('fs'),
  path = require('path'),
  mkdirs = require('mkdirs'),
  md5Crypto = require('crypto-js/md5'),
  rp = require('request-promise');


/**
 * @routePrefix('/putout/')
 */
module.exports = PutoutController = {

  /**
   * 出库列表
   * @route('list', 'GET')
   * @param req
   * @param res
   * @constructor
   */
  PUTOUT_LIST: function (req, res) {
    co(function* () {
      var $count  = req.query.$count || true
      var $offset = req.query.$offset || 0;
      var $limit = req.query.$limit || 0;
      var $filter = req.query.$filter || '';
      var condition = {}
      if($filter){
        condition['$and'] = [{ '$or': [{ 'putout_goods_name': new RegExp($filter, "i") }, { 'putout_goods_id': $filter }] }];
      }
      var count = yield M.putout.count(condition);
      var items =  yield M.putout.find(condition, null , {limit: +$limit,skip: +$offset})
      var newItems  = []
      if(items && items.length >= 0){
        for(var item of items){
                  // var putoutRole = yield M.putout.findOne({
                  //         _id: item._id
                  //    })
                  // item._doc['putout'] = putoutRole.role_id
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
   * 出库ADD操作
   * @route('opt', 'POST')
   * @param req
   * @param res
   * @constructor
   */
  PUTOUT_ADD: function (req, res) {
    co(function* () {
    var body = req.body;
    if(body){
           var resBody = yield M.putout.create(body)
           F.renderSuccessJson( res, req, "操作成功",resBody);
    }

    }).catch(F.handleErr.bind(null, res))
  },
  /**
   * 出库 删除操作
   * @route('opt', 'DELETE')
   * @param req
   * @param res
   * @constructor
   */
   PUTOUT_DELETE: function (req, res) {
     co(function* () {
     var body = req.body;
     if(body){
         var isHavePutout = yield M.putout.findOne({
           _id: body._id
         })
         if(isHavePutout){
           var resBody = yield M.putout.remove({ _id:isHavePutout._id});
           F.renderSuccessJson( res, req, "操作成功",resBody);
         }else{
            F.renderErrorJson( res, req, "操作失败"  + body.putout_goods_name + '出库不存在' );
         }
     }

     }).catch(F.handleErr.bind(null, res))
   },

  /**
   * 出库修改操作
   * @route('opt', 'PUT')
   * @param req
   * @param res
   * @constructor
   */
   PUTOUT_UPDATE: function (req, res) {
     co(function* () {
     var body = req.body;
     if(body){
         var isHavePutout = yield M.putout.findOne({
           _id: body._id
         })
         if(isHavePutout){
                var resBody = yield M.putout.update({ _id:isHavePutout._id},body,{multi:false});
                F.renderSuccessJson( res, req, "操作成功",resBody);
         }else{
            F.renderErrorJson( res, req, "操作失败" +  body.putout_goods_name +'出库不存在' );
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
  PUTOUT_TESTADD: function (req, res) {
    co(function* () {
      for (var i = 0; i < 1000; i++) {
        var putoutInfo = yield M.putout.create({
          "putout_person_name" : "测试名字1",
          "putout_person_id" : "1",
          "putout_connect_name" : "测试名字34",
          "putout_connect_id" : "34",
          "putout_customer_name" : "客户2",
          "putout_customer_id" : "12",
          "putout_house_name" : "福建仓库",
          "putout_house_id" : "FJ",
          "putout_desc" : "123ewr",
          "putout_price" : "11",
          "putout_num" : "3",
          "putout_goods_unit" : "个",
          "putout_goods_spec" : "1*16",
          "putout_goods_id" : "123",
          "putout_goods_name" : "巧克力"
        })
     }
      F.renderErrorJson( res, req, "登录失败！请确认出库名和密码");
    }).catch(F.handleErr.bind(null, res))
  },
};
