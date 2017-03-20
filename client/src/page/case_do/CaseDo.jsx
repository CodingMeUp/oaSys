import './style.less';
import React from 'react';
import reqwest from 'reqwest';
import { Button, Breadcrumb, Menu, Icon, Tree, Tooltip, Spin, Table, Tabs, Badge, Select, Form, Checkbox, Input, InputNumber, Affix } from 'antd'
import { Router, Route, Link, hashHistory } from 'react-router';
import Page from '../../framework/page/Page';
import FAIcon from '../../framework/faicon/FAIcon';
import PubSubMsg from '../../framework/common/pubsubmsg';
import CaseDoTodoList from './CaseDoTodoList';
import API from '../API';
import UserSelect from './UserSelect';
import CaseDoViewResult from './CaseDoViewResult';
import CaseDoViewHistoryResult from './CaseDoViewHistoryResult';
import CaseDistribution from './CaseDistribution';
import Funs from '../../framework/common/functions';
import Storage from '../../framework/common/storage';

const top_current_project = Funs.top_current_project + '_' + _USERINFO.userId;
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

const CaseDo = React.createClass({
  getInitialState() {
    return {
      loading: true,
      defaultActiveKey: tabsActiveKey,
      data: [],
      projectData: [],
      isOldProject: false
    }
  },
  componentDidMount() {
    let _this = this;
    PubSubMsg.subscribe('get_current_project', function (resData) {
      _this.isOldProject();
    });
    PubSubMsg.subscribe('update_todo_tree', function (resData) {
      _this.isOldProject();
    });
    this.isOldProject();//判断当前产品是否有旧项目执行数据
    this.setState({ loading: false });

    this.ztProductId = this.props.location.query.ztProductId;
    if(this.ztProductId){
      const ztProductId = this.ztProductId;
      PubSubMsg.publish('get_product', {
          ztProductId
      });
    }
    
  },
  isOldProject(params = {}) {

    params._id = Storage.local.get(top_current_project) ? Funs.decrypt(Storage.local.get(top_current_project).currentProject, Funs.secret) : null;
    params.type = Storage.local.get(top_current_project) ? Storage.local.get(top_current_project).type : null;
    
    if (params.type && params.type == "product") {
      reqwest({
        url: API.CASE_DO_IS_OLDPROJECT,
        method: 'get',
        data: params,
        type: 'json',
        success: (result) => {          
          let _this = this;
          _this.setState({ isOldProject: result.data });
        }
      });
    }

  },
  componentWillUnmount() {
    PubSubMsg.unsubscribe('get_current_project');
    PubSubMsg.unsubscribe('update_todo_tree');
  },
  onTabClick() {

  },
  render() {
    const pageHeader =
      <div>
        <h1 className="admin-page-header-title">用例执行</h1>
        <Breadcrumb>
          <Breadcrumb.Item>
            <Icon type="home" />
            首页
          </Breadcrumb.Item>
          <Breadcrumb.Item>用例管理</Breadcrumb.Item>
          <Breadcrumb.Item>用例执行</Breadcrumb.Item>
        </Breadcrumb>
      </div>;
    //add  by dwq 取消标签限制显示  
    // const auth = window._USERINFO.auth;
    // let authHasCaseAllot = false; // 判断是否有分配任务的权限
    // auth.forEach(item => {
    //   if (item.oper_href === '/client/case/do-allot') {
    //     authHasCaseAllot = true;
    //   }
    // });

    let tabPanes = [];
    tabPanes.push(
      <TabPane tab="待执行" key="todo">
        <CaseDoTodoList />
      </TabPane>
    );

    //if (authHasCaseAllot) {
      tabPanes.push(
        <TabPane tab="分配任务" key="taskByVT">
          <CaseDistribution />
        </TabPane>
      );
    //}
    // tabPanes.push(
    //   <TabPane tab="分配任务" key="task">
    //     <ProjectCaseSelect />
    //   </TabPane>
    // );
    tabPanes.push(
      <TabPane tab="查看执行结果" key="result">
        <CaseDoViewResult />
      </TabPane>
    );
    var proTypt = Storage.local.get(top_current_project) ? Storage.local.get(top_current_project).type : null;
    if (proTypt && proTypt == 'product') {
      if (this.state.isOldProject) {
        tabPanes.push(
          <TabPane tab="查看历史执行结果" key="historyResult">
            <CaseDoViewHistoryResult />
          </TabPane>
        );
      }

    }


    return (
      <Page header={pageHeader} loading={this.state.loading}>
        <Tabs size="small" defaultActiveKey={this.state.defaultActiveKey} tabPosition="top" onTabClick={this.onTabClick}>
          {tabPanes}
        </Tabs>
      </Page>
    );
  }
});

export default CaseDo;
