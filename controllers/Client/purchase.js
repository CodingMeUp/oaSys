var co = require('co'),
  moment = require('moment'),
  fs = require('fs'),
  path = require('path'),
  mkdirs = require('mkdirs'),
  md5Crypto = require('crypto-js/md5'),
  rp = require('request-promise');


/**
 * @routePrefix('/purchase/')
 */
module.exports = ApplyController = {

  /**
   * 采购列表
   * @route('purchase, 'GET')
   * @param req
   * @param res
   * @constructor
   */
  PURCHASE_LIST: function (req, res) {
    co(function* () {
      var $count  = req.query.$count || true
      var $offset = req.query.$offset || 0;
      var $limit = req.query.$limit || 0;
      var $filter = req.query.$filter || '';
      var condition = {}
      if($filter){
        condition['$and'] = [{ '$or': [{ 'purchase_name': new RegExp($filter, "i") }, { 'purchase_id': $filter }] }];
      }
      if(req.query.endDate && req.query.startDate && req.query.endDate.indexOf('null') == -1  &&  req.query.startDate.indexOf('null')  ==  -1){
        condition.createDate  = { "$gte": req.query.startDate, "$lt": req.query.endDate }
      }
      var count = yield M.purchase.count(condition);
      var items =  yield M.purchase.find(condition,'-_id', {limit: +$limit,skip: +$offset})
      var newItems  = []
      if(items && items.length >= 0){
        for(var item of items){
                  // var purchaseRole = yield M.purchase.findOne({
                  //         purchase_id: item.purchase_id
                  //    })
                  // item._doc['purchase'] = purchaseRole.role_id
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
   * 采购ADD操作
   * @route('opt', 'POST')
   * @param req
   * @param res
   * @constructor
   */
  PURCHASE_ADD: function (req, res) {
    co(function* () {
    var body = req.body;
    if(body){
        var isHaveApply = yield M.purchase.findOne({
          '$or': [{ purchase_id: body.purchase_id}]
        })
        if(isHaveApply){
            F.renderErrorJson( res, req, "已存在相同ID【" + body.purchase_id + "】或名称【" + body.purchase_name + "】");
        }else{
           var resBody = yield M.purchase.create(body)
           F.renderSuccessJson( res, req, "操作成功",resBody);
        }
    }

    }).catch(F.handleErr.bind(null, res))
  },
  /**
   * 采购 删除操作
   * @route('opt', 'DELETE')
   * @param req
   * @param res
   * @constructor
   */
   PURCHASE_DELETE: function (req, res) {
     co(function* () {
     var body = req.body;
     if(body){
         var isHaveApply = yield M.purchase.findOne({
           purchase_id: body.purchase_id
         })
         if(isHaveApply){
           var resBody = yield M.purchase.remove({ purchase_id:isHaveApply.purchase_id});
           F.renderSuccessJson( res, req, "操作成功",resBody);
         }else{
            F.renderErrorJson( res, req, "操作失败" + 'ID' +body.purchase_id+'采购不存在','ID' +body.purchase_id+'采购不存在' );
         }
     }

     }).catch(F.handleErr.bind(null, res))
   },

  /**
   * 采购修改操作
   * @route('opt', 'PUT')
   * @param req
   * @param res
   * @constructor
   */
   PURCHASE_UPDATE: function (req, res) {
     co(function* () {
     var body = req.body;
     if(body){
         var isHaveApply = yield M.purchase.findOne({
           purchase_id: body.purchase_id
         })
         if(isHaveApply){
                var resBody = yield M.purchase.update({ purchase_id:isHaveApply.purchase_id},body,{multi:false});
                F.renderSuccessJson( res, req, "操作成功",resBody);
         }else{
            F.renderErrorJson( res, req, "操作失败" +  'ID' +body.purchase_id+'采购不存在','ID' +body.purchase_id+'采购不存在' );
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
  // PURCHASE_TESTADD: function (req, res) {
  //   co(function* () {
  //     for (var i = 0; i < 1000; i++) {
  //       var purchaseInfo = yield M.purchase.create({
  //         purchase_id: i + '',
  //         purchase_name:  '测试名字' + i,
  //       })
  //    }
  //
  //     F.renderErrorJson( res, req, "登录失败！请确认采购名和密码");
  //   }).catch(F.handleErr.bind(null, res))
  // },
};
