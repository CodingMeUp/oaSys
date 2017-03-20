var express = require('express'),
  path = require('path'),
  cookieParser = require('cookie-parser'),
  session = require('express-session'),
  MongoStore = require('connect-mongo')(session),
  ejs = require('ejs'),
  logger = require('morgan'),
  bodyParser = require('body-parser'),
  passport = require('passport'),
  expressValidator = require('express-validator'),
  controller = require('./utils/controller');

var app = express();

/**
 * 全局变量
 * C 配置
 * M 数据model
 * F 方法
 */
global.C = require('./config');
global.M = {};
global.F = require(path.join(C.dir.controller, C.exceptFolder, 'funcs'));


app.set('views', path.join(__dirname, 'views'));
app.engine('html', ejs.__express);
app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, 'public')));
app.set('x-powered-by', false);
app.set('trust proxy', true);

app.use(logger('combined'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({extended: false, limit: '50mb'}));
app.use(cookieParser(C.cookie.secret));
C.session.store = new MongoStore(C.db);
app.use(session(C.session));
app.use(passport.initialize());
app.use(passport.session());
app.use(expressValidator({
  customValidators: {
    isArray: function (value) {
      return Array.isArray(value);
    },
    gte: function (param, num) {
      return param >= num;
    }
  }
}));


require(path.join(C.dir.model, C.exceptFolder)); // model初始化入口
require(path.join(C.dir.controller, C.exceptFolder))(app); // router初始化入口

//client 端 路由规则
controller.initControllers(app);


app.get('*', function (req, res) {
  res.render('error/404', {});
});

module.exports = app;
