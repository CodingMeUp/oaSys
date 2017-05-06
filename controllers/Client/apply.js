var co = require('co'),
  moment = require('moment'),
  fs = require('fs'),
  path = require('path'),
  mkdirs = require('mkdirs'),
  md5Crypto = require('crypto-js/md5'),
  rp = require('request-promise');


/**
 * @routePrefix('/apply/')
 */
module.exports = ApplyController = {

  /**
   * 供应商列表
   * @route('list', 'GET')
   * @param req
   * @param res
   * @constructor
   */
  APPLY_LIST: function (req, res) {
    co(function* () {
      var $count  = req.query.$count || true
      var $offset = req.query.$offset || 0;
      var $limit = req.query.$limit || 0;
      var $filter = req.query.$filter || '';
      var condition = {}
      if($filter){
        condition['$and'] = [{ '$or': [{ 'apply_name': new RegExp($filter, "i") }, { 'apply_id': $filter }] }];
      }
      var count = yield M.apply.count(condition);
      var items =  yield M.apply.find(condition,'-_id', {limit: +$limit,skip: +$offset})
      var newItems  = []
      if(items && items.length >= 0){
        for(var item of items){
                  // var applyRole = yield M.apply.findOne({
                  //         apply_id: item.apply_id
                  //    })
                  // item._doc['apply'] = applyRole.role_id
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
   * 供应商ADD操作
   * @route('opt', 'POST')
   * @param req
   * @param res
   * @constructor
   */
  APPLY_ADD: function (req, res) {
    co(function* () {
    var body = req.body;
    if(body){
        var isHaveCustomer = yield M.apply.findOne({
          apply_id: body.apply_id
        })
        if(isHaveCustomer){
            F.renderErrorJson( res, req, "已存在相同ID: " + body.apply_id);
        }else{
           var resBody = yield M.apply.create(body)
           F.renderSuccessJson( res, req, "操作成功",resBody);
        }
    }

    }).catch(F.handleErr.bind(null, res))
  },
  /**
   * 供应商 删除操作
   * @route('opt', 'DELETE')
   * @param req
   * @param res
   * @constructor
   */
   APPLY_DELETE: function (req, res) {
     co(function* () {
     var body = req.body;
     if(body){
         var isHaveCustomer = yield M.apply.findOne({
           apply_id: body.apply_id
         })
         if(isHaveCustomer){
           var resBody = yield M.apply.remove({ apply_id:isHaveCustomer.apply_id});
           F.renderSuccessJson( res, req, "操作成功",resBody);
         }else{
            F.renderErrorJson( res, req, "操作失败" + 'ID' +body.apply_id+'供应商不存在','ID' +body.apply_id+'供应商不存在' );
         }
     }

     }).catch(F.handleErr.bind(null, res))
   },

  /**
   * 供应商修改操作
   * @route('opt', 'PUT')
   * @param req
   * @param res
   * @constructor
   */
   APPLY_UPDATE: function (req, res) {
     co(function* () {
     var body = req.body;
     if(body){
         var isHaveCustomer = yield M.apply.findOne({
           apply_id: body.apply_id
         })
         if(isHaveCustomer){
            var resBody = yield M.apply.update({ apply_id:isHaveCustomer.apply_id},body,{multi:false});
            F.renderSuccessJson( res, req, "操作成功",resBody);
         }else{
            F.renderErrorJson( res, req, "操作失败" +  'ID' +body.apply_id+'供应商不存在','ID' +body.apply_id+'供应商不存在' );
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
  // APPLY_TESTADD: function (req, res) {
  //   co(function* () {
  //     for (var i = 0; i < 1000; i++) {
  //       var applyInfo = yield M.apply.create({
  //         apply_id: i + '',
  //         apply_name:  '测试名字' + i,
  //       })
  //    }
  //
  //     F.renderErrorJson( res, req, "登录失败！请确认供应商名和密码");
  //   }).catch(F.handleErr.bind(null, res))
  // },
};
