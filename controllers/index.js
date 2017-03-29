module.exports = function(app, co) {
    var rp = require('request-promise'),
        fs = require('fs'),
        md5Crypto = require('crypto-js/md5'),
        cache = require('../utils/cacheMemory'),
        _ = require('lodash');

app.route('/').get(function (req, res, next) {
  co(function* () {
    var client_md5 = '';
    if (process.env.NODE_ENV === 'production') {
      client_md5 = cache.get('client_md5');
      if (!client_md5) {
        var content = fs.readFileSync(C.dir.resource + '/client_static/index.js', 'utf-8');
        client_md5 = md5Crypto(content);
        cache.put('client_md5', client_md5);
      }
    }
    var auth = [];
    auth.push({
      oper_href: '/client/portal'
    })
    auth.push({
      oper_href: '/client/login'
    })

    res.render('client', {
      userId: 'req.session.userInfo._id',
      userName: 'req.session.userInfo.name',
      env: process.env.NODE_ENV,
      sdepcode: 'sdepcode',
      client_md5: client_md5,
      auth: JSON.stringify(auth)
    });
  }).catch(F.handleErr.bind(null, res))
});

};
