import React from 'react';
import Version from './version/Version';
import Deploy from './deploy/Deploy';
import Case from './case/Case';
import CaseList from './case/CaseList';
import CaseDoResultList from './case_do/CaseDoResultList';
import CaseDo from './case_do/CaseDo';
import CaseAudit from './case_audit/CaseAudit';
import Project from './project/Project';
import ProjectModule from './project/ProjectModule';
import ProjectAuth from './project/ProjectAuth';
import ProjectVersion from './project/ProjectVersion';
import ProjectTransform from './project/ProjectTransform';
import Bug from './bug/BugsList';
import BugView from './bug/BugView';
import BugEdit from './bug/BugEdit';
import BugCreate from './bug/BugCreate';
import Reports from './report/Reports';
import UserReports from './report/UserReports';
import ReportProject from './report/ReportProject';
import UserAuth from './auth/UserAuth';
import SelfTest from './selftest/SelfTest';
import Storage from '../framework/common/storage';
import Function from '../framework/common/functions';
import PubSubMsg from '../framework/common/pubsubmsg';

let routes = [
  { path: '/case', component: Case },
  { path: '/case/do', component: CaseDo },
  { path: '/case/list', component: CaseList },
  { path: '/case/result', component: CaseDoResultList},
  { path: '/case/audit', component: CaseAudit},
  { path: '/bug', component: Bug },
  { path: '/bug/view/:id', component: BugView },
  { path: '/bug/edit/:id', component: BugEdit },
  { path: '/bug/create', component: BugCreate },


  { path: '/project', component: Project },
  { path: '/projectModule',component:ProjectModule},
  { path: '/projectAuth',component:ProjectAuth },
  { path: '/ProjectVersion',component:ProjectVersion },
  { path: '/userAuthHandle', component: UserAuth },
  { path: '/selfTest', component: SelfTest },
  
  { path: '/reportproject', component: ReportProject },
  { path: '/reports', component: Reports },
  { path: '/userReports', component: UserReports },


  { path: '/systems/version', component: Version },
  { path: '/systems/deploy', component: Deploy },
  { path: '/systems/projectTransform',component:ProjectTransform }

];

const top_current_project = Function.top_current_project +'_'+_USERINFO.userId;
const top_project_hash = 'hash_'+_USERINFO.userId;
let auth = Storage.local.get(top_current_project)? Storage.local.get(top_current_project).auth:window._USERINFO.auth;

// PubSubMsg.subscribe('renderRouter', function (resData) {
//   // console.log(resData);
//   auth = resData.returnData.sessionInfo.userRoles;
// });

routes.forEach(item => {
  item.onEnter = function(nextState, replace) {
    let auth = Storage.local.get(top_current_project)? Storage.local.get(top_current_project).auth:window._USERINFO.auth;
    if (auth) {
      let pathname = nextState.location.pathname;
      Storage.local.set(top_project_hash,window.location.origin + '/client#' + pathname);
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