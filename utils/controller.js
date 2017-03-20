var fs = require("fs");
var annotation = require('./annotation');
var mappingArr = [];
var multipart = require('connect-multiparty'),
  multipartMiddleware = multipart();

function add_to_mapping(mapping) {
  mappingArr.push(mapping);
}

//解析controllers目录下所有.js文件
function initController(app, file, anno, dir) {
  var name = file.replace('.js', '');
  var actions = require('../controllers/' + dir + '/' + name);
  var mapping = actions["mapping"];


  var index = 0;
  Object.keys(actions).map(function (action) {
    var fn = actions[action];

    if (typeof(fn) === "function") {
      var a = anno.functions[action].annotations;
      if (a['route'][index] && a['route'][index][0] && a['route'][index][1]) {
        var url = (a['routePrefix'] ? a['routePrefix'] : '') + a['route'][index][0], method = a['route'][index][1];
        var isUpload = a['route'][index].length >= 3;
        switch (method.toLowerCase()) {
          default:
            app.get(url, fn);
            break;
          case 'post':
            // 当路由为POST 并且 参数第三个为上传 加载上传中间件
            if (isUpload) {
              app.post(url, multipartMiddleware, fn);
            } else {
              app.post(url, fn);
            }
            break;
          case 'put':
            app.put(url, fn);
            break;
          case 'delete':
            app.delete(url, fn);
            break;
          case 'no':
            break;
        }

        index++;
      }
    }
  });
}

module.exports = {
  initControllers: function (app) {
    fs.readdirSync(__dirname + '/../controllers/Client').forEach(function (file) {
      var anno = annotation.sync(__dirname + '/../controllers/Client/' + file);

      if (file !== '.svn') {
        initController(app, file, anno, 'Client');
      } else {
        console.log("Not booting .svn controller! ");
      }
    });

    // 所有接口的url：/show_interfaces
    app.get("/client/show_interfaces", function (req, res) {

      res.send("");
    });
  }
};
