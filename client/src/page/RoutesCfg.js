import React from 'react';
import Bug from './bug/BugsList';

import Storage from '../framework/common/storage';
import Function from '../framework/common/functions';
import PubSubMsg from '../framework/common/pubsubmsg';

let routes = [
  { path: '/bug', component: Bug },
]

routes.forEach(item => {
  item.onEnter = function(nextState, replace) {
    let auth = window._USERINFO.auth;
    if (auth) {
      let pathname = nextState.location.pathname;
      let isAuth = false;
      auth.forEach(item => {
        if ((pathname.indexOf("/bug/view/")>-1) || (pathname.indexOf("/bug/edit/")>-1)){
          if ((item.oper_href.indexOf("/bug/view/")>-1) || (item.oper_href.indexOf("/bug/edit/")>-1)){
            isAuth = true;
          }
        }else if (item.oper_href === '/client' + pathname) {
          isAuth = true;
        }
      });

      // 设置为true
      isAuth = true;

      if (!isAuth) {
         replace({
          pathname: '/401',
          state: { nextPathname: nextState.location.pathname }
        })
      }
    }
  }
});



export default routes;
