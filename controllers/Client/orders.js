var co = require('co'),
  moment = require('moment'),
  fs = require('fs'),
  path = require('path'),
  mkdirs = require('mkdirs'),
  md5Crypto = require('crypto-js/md5'),
  rp = require('request-promise');


/**
 * @routePrefix('/orders/')
 */
module.exports = ApplyController = {

  /**
   * 订单列表
   * @route('list', 'GET')
   * @param req
   * @param res
   * @constructor
   */
  ORDERS_LIST: function (req, res) {
    co(function* () {
      var $count  = req.query.$count || true
      var $offset = req.query.$offset || 0;
      var $limit = req.query.$limit || 0;
      var $filter = req.query.$filter || '';
      var condition = {}
      if($filter){
        condition['$and'] = [{ '$or': [{ 'orders_name': new RegExp($filter, "i") }, { 'orders_id': $filter }] }];
      }
      var count = yield M.orders.count(condition);
      var items =  yield M.orders.find(condition,'-_id', {limit: +$limit,skip: +$offset})
      var newItems  = []
      if(items && items.length >= 0){
        for(var item of items){
                  // var ordersRole = yield M.orders.findOne({
                  //         orders_id: item.orders_id
                  //    })
                  // item._doc['orders'] = ordersRole.role_id
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
   * 订单ADD操作
   * @route('opt', 'POST')
   * @param req
   * @param res
   * @constructor
   */
  ORDERS_ADD: function (req, res) {
    co(function* () {
    var body = req.body;
    if(body){
        var isHaveApply = yield M.orders.findOne({
          '$or': [{ orders_id: body.orders_id}]
        })
        if(isHaveApply){
            F.renderErrorJson( res, req, "已存在相同ID【" + body.orders_id + "】或名称【" + body.orders_name + "】");
        }else{
           var resBody = yield M.orders.create(body)
           F.renderSuccessJson( res, req, "操作成功",resBody);
        }
    }

    }).catch(F.handleErr.bind(null, res))
  },
  /**
   * 订单 删除操作
   * @route('opt', 'DELETE')
   * @param req
   * @param res
   * @constructor
   */
   ORDERS_DELETE: function (req, res) {
     co(function* () {
     var body = req.body;
     if(body){
         var isHaveApply = yield M.orders.findOne({
           orders_id: body.orders_id
         })
         if(isHaveApply){
           var resBody = yield M.orders.remove({ orders_id:isHaveApply.orders_id});
           F.renderSuccessJson( res, req, "操作成功",resBody);
         }else{
            F.renderErrorJson( res, req, "操作失败" + 'ID' +body.orders_id+'订单不存在','ID' +body.orders_id+'订单不存在' );
         }
     }

     }).catch(F.handleErr.bind(null, res))
   },

  /**
   * 订单修改操作
   * @route('opt', 'PUT')
   * @param req
   * @param res
   * @constructor
   */
   ORDERS_UPDATE: function (req, res) {
     co(function* () {
     var body = req.body;
     if(body){
         var isHaveApply = yield M.orders.findOne({
           orders_id: body.orders_id
         })
         if(isHaveApply){
                var resBody = yield M.orders.update({ orders_id:isHaveApply.orders_id},body,{multi:false});
                F.renderSuccessJson( res, req, "操作成功",resBody);
         }else{
            F.renderErrorJson( res, req, "操作失败" +  'ID' +body.orders_id+'订单不存在','ID' +body.orders_id+'订单不存在' );
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
  // ORDERS_TESTADD: function (req, res) {
  //   co(function* () {
  //     for (var i = 0; i < 1000; i++) {
  //       var ordersInfo = yield M.orders.create({
  //         orders_id: i + '',
  //         orders_name:  '测试名字' + i,
  //       })
  //    }
  //
  //     F.renderErrorJson( res, req, "登录失败！请确认订单名和密码");
  //   }).catch(F.handleErr.bind(null, res))
  // },
};
