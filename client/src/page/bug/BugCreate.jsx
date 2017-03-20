import './style.bug.less';
import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { browserHistory, Router, Route, Link } from 'react-router';
import { connect } from 'react-redux';
import moment from 'moment';
import FAIcon from '../../framework/faicon/FAIcon';
import { Breadcrumb, Button, Menu, Icon, Tree, Tooltip, Spin, message, Modal, Select, Dropdown, Table, Tabs, Form, Input, Upload } from 'antd';
import Page from '../../framework/page/Page';
import * as BugAction from '../../actions/bugs';
import UiCtrl from '../utils/UiCtrl';
import BUG_LANG from './BugLang';
import BugUtils from './BugUtils';
import _ from 'lodash';
import $ from 'jquery';
import Editor from '../utils/Editorer';
import BugCreateForm from './ctrl/BugCreateForm';
import API from '../API';


const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const TreeNode = Tree.TreeNode;
const TabPane = Tabs.TabPane;
const Option = Select.Option;
const FormItem = Form.Item;

let uuid = 0;
class BugCreate extends Component {
  constructor(props) {
    super(props);
    // this.selectOptions = BugUtils.getBugSelectOptions();
  }

  componentDidMount() {
    const { bugAction, location } = this.props;
    this.productId = +(location.query.productId);
    const bugId = +(location.query.bugId);
    if (this.productId) {
      bugAction.getBugCreateData(this.productId, false, null, bugId);
    }
  }

  componentWillUnmount() {
    
  }

  componentDidUpdate(prevProps) {
    const {bugAction} = this.props;
    if (this.props.createBugInfo && this.props.createBugInfo.id) {
      message.success('BUG 创建成功！');
      this.context.router.push('/bug?refresh=1&productId=' + this.productId);
      bugAction.clearBugCreateUpdateInfo();
      return false;
    }

    if (this.props.error) {
      message.error(this.props.error);
      bugAction.clearErrors();
      return false;
    }
  }

  
  goBack() {
    this.context.router.goBack();
  }

  render() {
    const { bugAction, bug } = this.props;

    const _this = this;

    const pageHeader =
      <div>
        <h1 className="admin-page-header-title">
          BUG创建
        </h1>
        <Breadcrumb>
          <Breadcrumb.Item>
            <Icon type="home" />
            首页
          </Breadcrumb.Item>
          <Breadcrumb.Item>BUG管理</Breadcrumb.Item>
          <Breadcrumb.Item>BUG创建</Breadcrumb.Item>
        </Breadcrumb>
      </div>;

    return (
      <Page header={pageHeader} loading={this.props.pageLoading} unShowPageAnimate={true}>
        <BugCreateForm 
          productList={this.props.productList} 
          projectList={this.props.projectList}
          taskList={this.props.taskList}
          storys={this.props.storys}
          users={this.props.users}
          builds={this.props.builds}
          modules={this.props.modules}
          bug={bug}
          bugAction={this.props.bugAction}
          productId={this.productId}
          goBack={this.goBack.bind(this)}
          />
      </Page>
    );

  }
}

BugCreate.contextTypes = {
  router: React.PropTypes.object.isRequired
};

BugCreate = Form.create()(BugCreate);

export default connect((state, props) => ({
  productList: state.bugcreate.productList,
  projectList: state.bugcreate.projectList,
  taskList: state.bugcreate.taskList,
  builds: state.bugcreate.builds,
  modules: state.bugcreate.modules,
  storys: state.bugcreate.storys,
  users: state.bugcreate.users,
  bug: state.bugcreate.bug,
  createBugInfo: state.bugcreate.createBugInfo,
  error: state.bugcreate.error
}), dispatch => ({
  bugAction: bindActionCreators(BugAction, dispatch)
}))(BugCreate);