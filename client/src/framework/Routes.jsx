import React from 'react';
import {Router, Route, hashHistory, browserHistory, Link, IndexRoute} from 'react-router'
import {Menu, Tooltip} from 'antd';
import FAIcon from './faicon/FAIcon';
import App from './app/App';
import Home from '../page/home/Home';
import Case from '../page/case/Case'
import Error404 from './error/Error404';
import Error401 from './error/Error401';
import SettingsPage from './settings/SettingsPage';
import {Provider} from 'react-redux';
import configureStore from '../reducers/store';

//import createBrowserHistory from 'history/lib/createBrowserHistory'
//const browserHistory = createBrowserHistory();

import PubSubMsg from './common/pubsubmsg';
import {getSidebarMenus, getCurrentSidebarMenu} from './SidebarMenu';
import {getHeaderMenus} from './HeaderMenu';
import pageRouts from '../page/RoutesCfg';

const store = configureStore();

/*
 * 根据菜单数据，初始化路由
 * */
const routes = {
  path: '/',
  component: App,
  indexRoute: { component: Case },
  childRoutes: pageRouts
};
/*
 * 所有未截获的请求,统一跳转到Error404组件
 * */
routes.childRoutes.push(
  { path: '/system/settings', component: SettingsPage },
  { path: '/401', component: Error401 },
  { path: '*', component: Error404 }
);
/*
 * 监听地址栏改变，通过左侧菜单状态
 * */
hashHistory.listen(function (data) {
  let [headerMenu, headerMenuCurrent] = getHeaderMenus();
  PubSubMsg.publish('header-menu', {
    menu: headerMenu,
    current: headerMenuCurrent
  });
  let menu = getSidebarMenus();
  let currentSidebarMenu = getCurrentSidebarMenu();
  let current = currentSidebarMenu ? currentSidebarMenu.key : '';
  let openKeys = currentSidebarMenu ? currentSidebarMenu.openKeys : [];
  PubSubMsg.publish('sidebar-menu', {
    menu,
    current,
    openKeys
  });
  PubSubMsg.publish('set-header-breadcrumb');
});

export default React.createClass({
  render() {
    return (
      <Provider store={store}>
        <Router routes={routes} history={hashHistory}/>
      </Provider>
    );
  }
});