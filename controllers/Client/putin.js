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
      var items =  yield M.putin.find(condition, null , {limit: +$limit,skip: +$offset}).sort({ createDate: -1 })
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
          //  var isHaveRemain = yield M.remain.findOne({
          //   goods_id: body.putin_goods_id,
          //   goods_name: body.putin_goods_name,
          //   goods_spec: body.putin_goods_spec
          // })
          // var dbBody = {}
          // if(isHaveRemain){
          //     dbBody.count = +isHaveRemain.count + (+body.putin_num)
          //     dbBody.total = +isHaveRemain.total + (+body.putin_num * +body.putin_price)
          //     yield M.remain.update({ _id: isHaveRemain._id },dbBody)
          //  }else{
          //     dbBody.goods_id = body.putin_goods_id
          //     dbBody.goods_name = body.putin_goods_name
          //     dbBody.goods_spec = body.putin_goods_spec
          //     dbBody.count = body.putin_num
          //     dbBody.total = body.putin_num * body.putin_price
          //     yield M.remain.create(dbBody)
          //  }
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


  /**
   * 批量添加测试数据
   * @route('testAdd', 'get')
   * @param req
   * @param res
   * @constructor
   */
  PUTIN_TESTADD: function (req, res) {
    co(function* () {
      for (var i = 0; i < 1000; i++) {
        var putinInfo = yield M.putin.create({
          "putin_person_name" : "测试名字1",
          "putin_person_id" : "1",
          "putin_connect_name" : "测试名字5",
          "putin_connect_id" : "5",
          "putin_apply_name" : "北京供应商",
          "putin_apply_id" : "123",
          "putin_house_name" : "天津仓库",
          "putin_house_id" : "tianj",
          "putin_desc" : "sdfd",
          "putin_price" : "12",
          "putin_num" : "12",
          "putin_goods_unit" : "个",
          "putin_goods_spec" : "16*16",
          "putin_goods_id" : "11",
          "putin_goods_name" : "芒果",
        })
     }

      F.renderErrorJson( res, req, "登录失败！请确认入库名和密码");
    }).catch(F.handleErr.bind(null, res))
  },
};
