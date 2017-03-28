import React from 'react';
import {Router, Route, hashHistory, browserHistory, Link, IndexRoute} from 'react-router'
import {Menu, Tooltip} from 'antd';
import FAIcon from './faicon/FAIcon';
import App from './app/App';
import Home from '../page/home/Home';
import Login from '../page/login/index';
import Portal from '../page/portal/index';
import Error404 from './error/Error404';
import Error401 from './error/Error401';
import {Provider} from 'react-redux';
import configureStore from '../reducers/store';
import PubSubMsg from './common/pubsubmsg';
import pageRouts from '../page/RoutesCfg';

const store = configureStore();

/*
 * 根据菜单数据，初始化路由
 * */
const routes = {
  path: '/',
  component: App,
  indexRoute: { component: Login },
  childRoutes: pageRouts
};
/*
 * 所有未截获的请求,统一跳转到Error404组件
 * */
routes.childRoutes.push(

  { path: '/401', component: Error401 },
  { path: '*', component: Error404 }
);

export default React.createClass({
  render() {
    return (
      <Provider store={store}>
        <Router routes={routes} history={hashHistory}/>
      </Provider>
    );
  }
});
