var funcs,
    co = require('co'),
    fs = require('fs'),
    path = require('path'),
    moment = require('moment'),
    rp = require('request-promise');

funcs = {
    /**
   * 格式化日期
   */
    date: {
        format: function() {
            var args = arguments;
            if (args.length === 1) {
                return moment().format(args[0]);
            }
            if (args.length === 2) {
                return moment(args[0]).format(args[1]);
            }

            return moment().format('YYYY-MM-DD HH:mm:ss');
        }
    },
    formatDate: moment().format('YYYY-MM-DD HH:mm:ss'),
    formatMongoDate: moment().format('YYYY-MM-DD HH:mm:ss'),
    formatNowDate: function() {
        return moment().format('YYYY-MM-DD HH:mm:ss')
    },

    renderSuccessJson: function(res, req,message, data) {
        if(req.method == "OPTIONS"){
            res.send(200);/*让options请求快速返回*/
        }else{
            res.status(200).json({message: message, data: data });
        }
    },
    renderErrorJson: function(res,req, message,error) {
        if(req.method == "OPTIONS"){
            res.send(200);/*让options请求快速返回*/
        }else{
            res.status(400).json({message: message, error: error});
            // res.json({status: 500, message: message, data: {}, error: error});
        }

    },
    setUserSession: function(req, userid, name, _id, userRoles, personInfo, projects) {
        req.session.userInfo = {
            isLogined: true,
            userid: userid,
            name: name,
            _id: _id,
            userRoles: userRoles,
            personInfo: personInfo,
            projects: projects
        };
    },
    setUserCookie: function(res, val) {
        res.cookie(C.cookie.user_cookie_key, val, {
            signed: true,
            maxAge: 3600000 * 24 * 30,
            httpOnly: true
        });
    },

    /**
   * 统一服务错误处理
   * @param res
   * @param err
   */
    handleErr: function(res, err) {
        console.error("error: ", err);
        res.status(500);
        res.json({error: err.toString()});
    }
};

module.exports = funcs;
