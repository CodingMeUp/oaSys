var
  path = require('path'),
  root = path.resolve(__dirname, '..'),
  envConfig = require('../env.config').dev.server,
  config = {
    siteTitle: '库房管理系统平台',
    session: {
      name: 'nd.qa.session',
      secret: 'NjxEKC0%HOL&Ga1zLBTOC4!QrEtAv2e7',
      resave: true,
      saveUninitialized: true,
      cookie: { maxAge: 1000 * 60 * 60 * 24 }
    },
    cookie: {
      secret: '&atIHSIRtN5*JejVLUiFnbNQ4qLlOSqY',
      user_cookie_key: 'nd.qa.u'
    },
    db: { // 数据库配置
      url:'mongodb://localhost:27017/oa',
      opts: {
        user: '',
        pass: ''
      }
    },
    contextPath: '/',
    port: envConfig.port, // 程序端口
    dir: { // 目录配置
      root: root,
      model: path.resolve(root, 'models'),
      controller: path.resolve(root, 'controllers'),
      resource: path.resolve(root, 'public'),
      upload: ''
    },
    resourceFixUrl: '', // 静态资源web访问修正路径
    exceptFolder: 'except' // models 和 controller 中read dir排除的目录名称
  };

module.exports = config;
