import './style.less';
import React from 'react';
import reqwest from 'reqwest';
import { Button, Breadcrumb, Menu, Icon, Tree, Tooltip, Spin, Table, Tabs, Badge, Select, Form, Checkbox, Input, InputNumber, Affix } from 'antd'
import { Router, Route, Link, hashHistory } from 'react-router';
import Page from '../../framework/page/Page';
import FAIcon from '../../framework/faicon/FAIcon';
import PubSubMsg from '../../framework/common/pubsubmsg';
import SelfTestTodoList from './SelfTestTodoList';
import SelfTestResult from './SelfTestResult';
import SelfTestResultList from './SelfTestResultList';
import SelfTestViewResult from './SelfTestViewResult';
import API from '../API';
import UserSelect from '../case_do/UserSelect';

const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const CheckboxGroup = Checkbox.Group;

let doSelftestTab = false; // 判断是否有开发执行的权限
const CaseDo = React.createClass({
  getInitialState() {
    return {
      loading: true,
      defaultActiveKey: 'selftestresult',
      data: [],
      projectData: []
    }
  },
  componentDidMount() {
    if(doSelftestTab){
      this.setState({ loading: false, defaultActiveKey: 'doselftest'});
    }else{
      this.setState({ loading: false });
    }  
  },
  onTabClick() {

  },
  render() {
    const pageHeader =
      <div>
        <h1 className="admin-page-header-title">开发自测</h1>
        <Breadcrumb>
          <Breadcrumb.Item>
            <Icon type="home" />
            首页
          </Breadcrumb.Item>
          <Breadcrumb.Item>开发自测</Breadcrumb.Item>
        </Breadcrumb>
      </div>;
    const auth = window._USERINFO.auth;
    auth.forEach(item => {
      if (item.oper_href === '/client/do-selfTest') {
        doSelftestTab = true;
      }
    });

    let tabPanes = [];
    if (doSelftestTab) {
      tabPanes.push(
        <TabPane tab="执行自测" key="doselftest">
          <SelfTestTodoList />
        </TabPane>
      );
    }

    tabPanes.push(
      <TabPane tab="自测结果查看" key="selftestresult">
        <SelfTestViewResult />
      </TabPane>
    );


    return (
      <Page header={pageHeader} loading={this.state.loading}>
        <Tabs size="small" defaultActiveKey={this.state.defaultActiveKey} tabPosition="top"  onTabClick={this.onTabClick}>
          {tabPanes}
        </Tabs>
      </Page>
    );
  }
});

export default CaseDo;
