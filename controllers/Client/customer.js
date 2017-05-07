var co = require('co'),
  moment = require('moment'),
  fs = require('fs'),
  path = require('path'),
  mkdirs = require('mkdirs'),
  md5Crypto = require('crypto-js/md5'),
  rp = require('request-promise');


/**
 * @routePrefix('/customer/')
 */
module.exports = CustomerController = {

  /**
   * 客户列表
   * @route('list', 'GET')
   * @param req
   * @param res
   * @constructor
   */
  CUSTOMER_LIST: function (req, res) {
    co(function* () {
      var $count  = req.query.$count || true
      var $offset = req.query.$offset || 0;
      var $limit = req.query.$limit || 0;
      var $filter = req.query.$filter || '';
      var condition = {}
      if($filter){
        condition['$and'] = [{ '$or': [{ 'customer_name': new RegExp($filter, "i") }, { 'customer_id': $filter }] }];
      }
      var count = yield M.customer.count(condition);
      var items =  yield M.customer.find(condition,'-_id', {limit: +$limit,skip: +$offset})
      var newItems  = []
      if(items && items.length >= 0){
        for(var item of items){
                  // var customerRole = yield M.customer.findOne({
                  //         customer_id: item.customer_id
                  //    })
                  // item._doc['customer'] = customerRole.role_id
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
   * 客户ADD操作
   * @route('opt', 'POST')
   * @param req
   * @param res
   * @constructor
   */
  CUSTOMER_ADD: function (req, res) {
    co(function* () {
    var body = req.body;
    if(body){
        var isHaveCustomer = yield M.customer.findOne({
          '$or': [{ customer_id: body.customer_id}, {customer_name: body.customer_name}]
        })
        if(isHaveCustomer){
            F.renderErrorJson( res, req, "已存在相同ID【" + body.customer_id + "】或名称【" + body.customer_name + "】");
        }else{
           var resBody = yield M.customer.create(body)
           F.renderSuccessJson( res, req, "操作成功",resBody);
        }
    }

    }).catch(F.handleErr.bind(null, res))
  },
  /**
   * 客户 删除操作
   * @route('opt', 'DELETE')
   * @param req
   * @param res
   * @constructor
   */
   CUSTOMER_DELETE: function (req, res) {
     co(function* () {
     var body = req.body;
     if(body){
         var isHaveCustomer = yield M.customer.findOne({
           customer_id: body.customer_id
         })
         if(isHaveCustomer){
           var resBody = yield M.customer.remove({ customer_id:isHaveCustomer.customer_id});
           F.renderSuccessJson( res, req, "操作成功",resBody);
         }else{
            F.renderErrorJson( res, req, "操作失败" + 'ID' +body.customer_id+'客户不存在','ID' +body.customer_id+'客户不存在' );
         }
     }

     }).catch(F.handleErr.bind(null, res))
   },

  /**
   * 客户修改操作
   * @route('opt', 'PUT')
   * @param req
   * @param res
   * @constructor
   */
   CUSTOMER_UPDATE: function (req, res) {
     co(function* () {
     var body = req.body;
     if(body){
         var isHaveCustomer = yield M.customer.findOne({
           customer_id: body.customer_id
         })
         if(isHaveCustomer){
              var sameName = yield M.customer.findOne({
                 customer_name: body.customer_name
              })
              if(sameName){
                  F.renderErrorJson( res, req, "已存在相同名称【" + body.customer_name + "】");
              }else{
                var resBody = yield M.customer.update({ customer_id:isHaveCustomer.customer_id},body,{multi:false});
                F.renderSuccessJson( res, req, "操作成功",resBody);
              }
         }else{
            F.renderErrorJson( res, req, "操作失败" +  'ID' +body.customer_id+'客户不存在','ID' +body.customer_id+'客户不存在' );
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
  // CUSTOMER_TESTADD: function (req, res) {
  //   co(function* () {
  //     for (var i = 0; i < 1000; i++) {
  //       var customerInfo = yield M.customer.create({
  //         customer_id: i + '',
  //         customer_name:  '测试名字' + i,
  //       })
  //    }
  //
  //     F.renderErrorJson( res, req, "登录失败！请确认客户名和密码");
  //   }).catch(F.handleErr.bind(null, res))
  // },
};
