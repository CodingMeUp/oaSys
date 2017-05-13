var co = require('co'),
  moment = require('moment'),
  fs = require('fs'),
  path = require('path'),
  mkdirs = require('mkdirs'),
  md5Crypto = require('crypto-js/md5'),
  rp = require('request-promise');


/**
 * @routePrefix('/goods/')
 */
module.exports = GoodsController = {

  /**
   * 商品库存列表
   * @route('goodsremain', 'GET')
   * @param req
   * @param res
   * @constructor
   */
  GOODSREMAIN_LIST: function (req, res) {
    co(function* () {
      var $count  = req.query.$count || true
      var $offset = req.query.$offset || 0;
      var $limit = req.query.$limit || 0;
      var $filter = req.query.$filter || '';
      var conditionIn = {}
      var conditionOut = {}
      if($filter){
        conditionIn['$and'] = [{ '$or': [{ 'putin_goods_name': new RegExp($filter, "i") }, { 'putin_goods_id': $filter }] }];
        conditionOut['$and'] = [{ '$or': [{ 'putout_goods_name': new RegExp($filter, "i") }, { 'putout_goods_id': $filter }] }];
      }

      var putinItem  =  yield M.putin.aggregate([
        { $match : conditionIn },
        { $group : {_id : "$putin_goods_id", num_tutorial : {$sum : '$putin_num'} } }
      ])
      var putoutItem  =  yield M.putout.aggregate([
        { $match : conditionOut },
        { $group : {_id : "$putout_goods_id", num_tutorial : {$sum : '$putout_num'} } }
      ])

      var newObj = {}
      if(putinItem && putinItem.length >= 0){
        for(var pin of putinItem){
               newObj[pin._id] = pin.num_tutorial
          }
      }

      if(putoutItem && putoutItem.length >= 0){
        for(var pout of putoutItem){
            if( newObj[pout._id] ){
                  newObj[pout._id] -= pout.num_tutorial
            }else{
                  newObj[pout._id]  = (-pout.num_tutorial)
            }
        }
      }


      var newItems  = []
     for(var id  in newObj ){
          var goods  = yield M.goods.findOne({ goods_id: id })
          goods._doc['count'] = newObj[id]
          newItems.push(goods)
     }
     var resObj = {}
     resObj.count = newItems.length;
     resObj.items = newItems
     if(resObj){
              F.renderSuccessJson( res, req, "获取成功",resObj);
        }else{
              F.renderErrorJson( res, req, "获取失败！请确认参数");
        }

    }).catch(F.handleErr.bind(null, res))
  },

  /**
   * 商品列表
   * @route('list', 'GET')
   * @param req
   * @param res
   * @constructor
   */
  GOODS_LIST: function (req, res) {
    co(function* () {
      var $count  = req.query.$count || true
      var $offset = req.query.$offset || 0;
      var $limit = req.query.$limit || 0;
      var $filter = req.query.$filter || '';
      var condition = {}
      if($filter){
        condition['$and'] = [{ '$or': [{ 'goods_name': new RegExp($filter, "i") }, { 'goods_id': $filter }] }];
      }
      var count = yield M.goods.count(condition);
      var items =  yield M.goods.find(condition, null , {limit: +$limit,skip: +$offset})
      var newItems  = []
      if(items && items.length >= 0){
        for(var item of items){
                  // var goodsRole = yield M.goods.findOne({
                  //         goods_id: item.goods_id
                  //    })
                  // item._doc['goods'] = goodsRole.role_id
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
   * 商品ADD操作
   * @route('opt', 'POST')
   * @param req
   * @param res
   * @constructor
   */
  GOODS_ADD: function (req, res) {
    co(function* () {
    var body = req.body;
    if(body){
        var isHaveHouse = yield M.goods.findOne({
          '$or': [{ goods_id: body.goods_id}, {goods_name: body.goods_name,goods_spec: body.goods_spec}]
        })
        if(isHaveHouse){
            F.renderErrorJson( res, req, "已存在相同ID【" + body.goods_id + "】或相同名称规格【" + body.goods_name + ',' + body.goods_spec + "】");
        }else{
           var resBody = yield M.goods.create(body)
           F.renderSuccessJson( res, req, "操作成功",resBody);
        }
    }

    }).catch(F.handleErr.bind(null, res))
  },
  /**
   * 商品 删除操作
   * @route('opt', 'DELETE')
   * @param req
   * @param res
   * @constructor
   */
   GOODS_DELETE: function (req, res) {
     co(function* () {
     var body = req.body;
     if(body){
         var isHaveHouse = yield M.goods.findOne({
           goods_id: body.goods_id
         })
         if(isHaveHouse){
           var resBody = yield M.goods.remove({ goods_id:isHaveHouse.goods_id});
           F.renderSuccessJson( res, req, "操作成功",resBody);
         }else{
            F.renderErrorJson( res, req, "操作失败" + 'ID' +body.goods_id+'商品不存在','ID' +body.goods_id+'商品不存在' );
         }
     }

     }).catch(F.handleErr.bind(null, res))
   },

  /**
   * 商品修改操作
   * @route('opt', 'PUT')
   * @param req
   * @param res
   * @constructor
   */
   GOODS_UPDATE: function (req, res) {
     co(function* () {
     var body = req.body;
     if(body){
         var isHaveHouse = yield M.goods.findOne({
           goods_id: body.goods_id
         })
         if(isHaveHouse){
              var sameName = yield M.goods.findOne({
                 goods_name: body.goods_name,
                 goods_spec: body.goods_spec
              })
              if(sameName){
                     F.renderErrorJson( res, req, "相同名称规格【" + body.goods_name + ',' + body.goods_spec + "】");
              }else{
                var resBody = yield M.goods.update({ goods_id:isHaveHouse.goods_id},body,{multi:false});
                F.renderSuccessJson( res, req, "操作成功",resBody);
              }
         }else{
            F.renderErrorJson( res, req, "操作失败" +  'ID' +body.goods_id+'商品不存在','ID' +body.goods_id+'商品不存在' );
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
  // GOODS_TESTADD: function (req, res) {
  //   co(function* () {
  //     for (var i = 0; i < 1000; i++) {
  //       var goodsInfo = yield M.goods.create({
  //         goods_id: i + '',
  //         goods_name:  '测试名字' + i,
  //       })
  //    }
  //
  //     F.renderErrorJson( res, req, "登录失败！请确认商品名和密码");
  //   }).catch(F.handleErr.bind(null, res))
  // },
};
