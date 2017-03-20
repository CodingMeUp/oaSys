import './style.less';
import React from 'react';
import reqwest from 'reqwest';
import { Button, Breadcrumb, Menu, Icon, Tree, Tooltip, Spin, Table, Tabs, Badge, Select, Form, Checkbox, Input, InputNumber, Affix } from 'antd'
import { Router, Route, Link, hashHistory } from 'react-router';
import Page from '../../framework/page/Page';
import FAIcon from '../../framework/faicon/FAIcon';
import PubSubMsg from '../../framework/common/pubsubmsg';
import CaseAuditTodoList from './CaseAuditToDoList';
import CaseAuditDistribution from './CaseAuditDistribution';
import API from '../API';

const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const CheckboxGroup = Checkbox.Group;
// 页面切换根据传参tab=定位锚点..
let tabsActiveKey = window._USERINFO.caseDoActivityKey;
let href = window.location.href;
if (href.indexOf('tab=') > 0) {
  let s = /tab=.*/.exec(href)[0];
  if (s.indexOf('&') > 0) {
    s = s.split('&')[0];
  }
  s = s.replace('tab=', '');
  tabsActiveKey = s;
}

const CaseAudit = React.createClass({
  getInitialState() {
    return {
      loading: true,
      defaultActiveKey: tabsActiveKey,
      data: [],
      projectData: [],
      isShowAuditModule: false
    }
  },
  componentDidMount() {
    this.setState({ loading: false });
  },
  componentWillUnmount() {
    PubSubMsg.unsubscribe('refresh-todo-tree-data');
  },
  onTabClick() {

  },
  onChange(activeKey) {
    if (activeKey === 'todo') {
      //切换到用例审核页面的时候，刷新树，展示模块对应用例数据    
      PubSubMsg.publish('refresh-todo-tree-data', { isShowAuditModule: true });
    }
  },
  render() {
    const pageHeader =
      <div>
        <h1 className="admin-page-header-title">用例审核</h1>
        <Breadcrumb>
          <Breadcrumb.Item>
            <Icon type="home" />
            首页
          </Breadcrumb.Item>
          <Breadcrumb.Item>用例管理</Breadcrumb.Item>
          <Breadcrumb.Item>用例审核</Breadcrumb.Item>
        </Breadcrumb>
      </div>;
    const auth = window._USERINFO.auth;
    let authHasAudit = false; // 判断是否有分配任务的权限
    auth.forEach(item => {
      if (item.oper_href === '/client/case/auditDistribution') {
        authHasAudit = true;
      }
    });

    let tabPanes = [];
    tabPanes.push(
      <TabPane tab="用例审核" key="todo">
        <CaseAuditTodoList />
      </TabPane>
    );
    if (authHasAudit) {
      tabPanes.push(
        <TabPane tab="审核用例分配" key="result">
          <CaseAuditDistribution />
        </TabPane>
      );
    }



    return (
      <Page header={pageHeader} loading={this.state.loading}>
        <Tabs size="small" defaultActiveKey={this.state.defaultActiveKey} tabPosition="top"
          onTabClick={this.onTabClick} onChange={this.onChange}>
          {tabPanes}
        </Tabs>
      </Page>
    );
  }
});

export default CaseAudit;
