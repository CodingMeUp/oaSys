import './style.bug.less';
import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { browserHistory, Router, Route, Link } from 'react-router';
import { connect } from 'react-redux';
import moment from 'moment';
import FAIcon from '../../framework/faicon/FAIcon';
import { Breadcrumb, Button, Menu, Icon, Tree, Tooltip, Spin, message, Modal, Select, Dropdown, Table, Input, Form, DatePicker, Alert } from 'antd';
import Storage from '../../framework/common/storage';
import Funs from '../../framework/common/functions';
import * as BugAction from '../../actions/bugs';
import BUG_LANG from './BugLang';
import _ from 'lodash';
import PubSubMsg from '../../framework/common/pubsubmsg';

const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const TreeNode = Tree.TreeNode;
const ButtonGroup = Button.Group;
const DropdownButton = Dropdown.Button;
const Option = Select.Option;

class BugsList extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
  }
  componentWillUnmount() {

  }
  componentDidUpdate(prevProps) {

  }

  render() {

    const pageHeader =
      <div>
        <h1 className="admin-page-header-title">
          BUG管理
        </h1>
        <Breadcrumb>
          <Breadcrumb.Item>
            <Icon type="home" />
            首页
          </Breadcrumb.Item>
          <Breadcrumb.Item>BUG管理</Breadcrumb.Item>
        </Breadcrumb>
      </div>;
    return (
        <div className="bug-header" >
        </div>
    );
  }
}

BugsList.contextTypes = {
  router: React.PropTypes.object.isRequired
};

BugsList = Form.create()(BugsList);

export default connect((state, props) => ({
  tableLoading: state.buglist.tableLoading,
  bugs: state.buglist.bugs,
  modules: state.buglist.modules,
  projects: state.buglist.projects,
  pagination: state.buglist.pagination,
  sideBarIsDisplay: state.buglist.sideBarIsDisplay,
  searchBarIsDisplay: state.buglist.searchBarIsDisplay,
  error: state.buglist.error,
  searchBarSpinning: state.buglist.searchBarSpinning,
  modalVisable: state.bugview.modalVisable,
  users: state.buglist.users,
  actions: state.buglist.actions,
  productList: state.buglist.productList,
  projectList: state.buglist.projectList,
  builds: state.buglist.builds,
}), dispatch => ({
  bugAction: bindActionCreators(BugAction, dispatch)
}))(BugsList);
