var co = require('co'),
  moment = require('moment'),
  fs = require('fs'),
  path = require('path'),
  mkdirs = require('mkdirs'),
  md5Crypto = require('crypto-js/md5'),
  rp = require('request-promise');

/**
 * @routePrefix('/client')
 */
module.exports = BugController = {
  /**
   * 根据ID 获取 BUG信息
   * @route('ac', 'GET')
   * @param req
   * @param res
   * @constructor
   */
  GET_BUG_BY_ID: function (req, res) {
    co(function* () {

        console.log(req)
        F.renderSuccessJson(res, "", {});
    }).catch(F.handleErr.bind(null, res))
  },

};
