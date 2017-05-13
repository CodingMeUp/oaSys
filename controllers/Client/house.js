var co = require('co'),
  moment = require('moment'),
  fs = require('fs'),
  path = require('path'),
  mkdirs = require('mkdirs'),
  md5Crypto = require('crypto-js/md5'),
  rp = require('request-promise');


/**
 * @routePrefix('/house/')
 */
module.exports = HouseController = {

  /**
   * cangku 库存列表
   * @route('houseremain', 'GET')
   * @param req
   * @param res
   * @constructor
   */
  HOUSEREMAIN_LIST: function (req, res) {
    co(function* () {
      var $count  = req.query.$count || true
      var $offset = req.query.$offset || 0;
      var $limit = req.query.$limit || 0;
      var $filter = req.query.$filter || '';
      var condition = {}
      if($filter){
        condition['$and'] = [{ '$or': [{ 'goods_name': new RegExp($filter, "i") }, { 'goods_id': $filter }] }];
      }

      var goods = yield M.goods.find(condition)
      var newItems  = []
     var houses = yield M.house.find()
      for(var i = 0 ; i < goods.length; i++){

           var putinItem  =  yield M.putin.aggregate([
              { $match : { putin_goods_id : goods[i].goods_id } },
              { $group : {_id : "$putin_house_id", num_tutorial : {$sum : '$putin_num'} } }
            ])
            var putoutItem  =  yield M.putout.aggregate([
              { $match : { putout_goods_id : goods[i].goods_id } },
              { $group : {_id : "$putout_house_id", num_tutorial : {$sum : '$putout_num'} } }
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

            var houseObj ={}
            for(var  j = 0 ; j < houses.length  ; j++){
                 for(var id  in newObj ){
                      if(   id  ==  houses[j].house_id ){
                          houseObj[houses[j].house_id + '__' + houses[j].house_name] = newObj[id]
                          break
                      }else{
                          houseObj[houses[j].house_id + '__' + houses[j].house_name]  = 0
                      }
                }
            }

            var pushObj = Object.assign({}, houseObj , goods[i]._doc)
            if( (Object.prototype.isPrototypeOf(houseObj) && Object.keys(houseObj).length == 0)  ){

            }else{
                  newItems.push(pushObj)
            }

      }

     var resObj = {}
     resObj.count = newItems.length;
     resObj.items = newItems
     resObj.allHouse = houses
     if(resObj){
              F.renderSuccessJson( res, req, "获取成功",resObj);
        }else{
              F.renderErrorJson( res, req, "获取失败！请确认参数");
        }

    }).catch(F.handleErr.bind(null, res))
  },

  /**
   * 仓库列表
   * @route('list', 'GET')
   * @param req
   * @param res
   * @constructor
   */
  HOUSE_LIST: function (req, res) {
    co(function* () {
      var $count  = req.query.$count || true
      var $offset = req.query.$offset || 0;
      var $limit = req.query.$limit || 0;
      var $filter = req.query.$filter || '';
      var condition = {}
      if($filter){
        condition['$and'] = [{ '$or': [{ 'house_name': new RegExp($filter, "i") }, { 'house_id': $filter }] }];
      }
      var count = yield M.house.count(condition);
      var items =  yield M.house.find(condition,'-_id', {limit: +$limit,skip: +$offset})
      var newItems  = []
      if(items && items.length >= 0){
        for(var item of items){
                  // var houseRole = yield M.house.findOne({
                  //         house_id: item.house_id
                  //    })
                  // item._doc['house'] = houseRole.role_id
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
   * 仓库ADD操作
   * @route('opt', 'POST')
   * @param req
   * @param res
   * @constructor
   */
  HOUSE_ADD: function (req, res) {
    co(function* () {
    var body = req.body;
    if(body){
        var isHaveHouse = yield M.house.findOne({
          '$or': [{ house_id: body.house_id}, {house_name: body.house_name}]
        })
        if(isHaveHouse){
            F.renderErrorJson( res, req, "已存在相同ID【" + body.house_id + "】或名称【" + body.house_name + "】");
        }else{
           var resBody = yield M.house.create(body)
           F.renderSuccessJson( res, req, "操作成功",resBody);
        }
    }

    }).catch(F.handleErr.bind(null, res))
  },
  /**
   * 仓库 删除操作
   * @route('opt', 'DELETE')
   * @param req
   * @param res
   * @constructor
   */
   HOUSE_DELETE: function (req, res) {
     co(function* () {
     var body = req.body;
     if(body){
         var isHaveHouse = yield M.house.findOne({
           house_id: body.house_id
         })
         if(isHaveHouse){
           var resBody = yield M.house.remove({ house_id:isHaveHouse.house_id});
           F.renderSuccessJson( res, req, "操作成功",resBody);
         }else{
            F.renderErrorJson( res, req, "操作失败" + 'ID' +body.house_id+'仓库不存在','ID' +body.house_id+'仓库不存在' );
         }
     }

     }).catch(F.handleErr.bind(null, res))
   },

  /**
   * 仓库修改操作
   * @route('opt', 'PUT')
   * @param req
   * @param res
   * @constructor
   */
   HOUSE_UPDATE: function (req, res) {
     co(function* () {
     var body = req.body;
     if(body){
         var isHaveHouse = yield M.house.findOne({
           house_id: body.house_id
         })
         if(isHaveHouse){
              var sameName = yield M.house.findOne({
                 house_name: body.house_name
              })
              if(sameName){
                  F.renderErrorJson( res, req, "已存在相同名称【" + body.house_name + "】");
              }else{
                var resBody = yield M.house.update({ house_id:isHaveHouse.house_id},body,{multi:false});
                F.renderSuccessJson( res, req, "操作成功",resBody);
              }
         }else{
            F.renderErrorJson( res, req, "操作失败" +  'ID' +body.house_id+'仓库不存在','ID' +body.house_id+'仓库不存在' );
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
  // HOUSE_TESTADD: function (req, res) {
  //   co(function* () {
  //     for (var i = 0; i < 1000; i++) {
  //       var houseInfo = yield M.house.create({
  //         house_id: i + '',
  //         house_name:  '测试名字' + i,
  //       })
  //    }
  //
  //     F.renderErrorJson( res, req, "登录失败！请确认仓库名和密码");
  //   }).catch(F.handleErr.bind(null, res))
  // },
};
