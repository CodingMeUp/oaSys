module.exports = function (app) {
  var
    path = require('path'),
    fs = require('fs'),
    co = require('co'),
    rp = require('request-promise');

  // 遍历controllers文件夹，执行所有router文件
  function eachFiles(dir) {
    fs.readdirSync(dir).forEach(function (name) {
      if (path.extname(name) !== '') {
        require(path.join(dir, name))(app, co);
      } else if (name !== C.exceptFolder && name !== '.DS_Store' && name !== 'Client') { // 如果是文件夹并且不等于排除目录，则递归继续往下找(".DS_Storeo"为mac缓存，这里特殊处理)
        // Client 排除掉， 使用新的Controller规则
        eachFiles(path.join(dir, name));
      }
    })
  }

  // 遍历所有router
  eachFiles(C.dir.controller);
};
