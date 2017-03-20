import '../style.bug.less';
import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { browserHistory, Router, Route, Link } from 'react-router';
import { connect } from 'react-redux';
import moment from 'moment';
import FAIcon from '../../../framework/faicon/FAIcon';
import { Breadcrumb, Button, Menu, Icon, Tree, Tooltip, Spin, message, Modal, Select, Dropdown, Table, Tabs, Form, Input, Upload } from 'antd';
import * as BugAction from '../../../actions/bugs';
import Editor from '../../utils/Editorer';
import BugCreateForm from '../ctrl/BugCreateForm';
import _ from 'lodash';
import PubSubMsg from '../../../framework/common/pubsubmsg';

const FormItem = Form.Item;

class BugCreateWin extends Component {
  constructor(props) {
    super(props); 

  }

  componentDidMount() {
    const { bugAction, location } = this.props;

    bugAction.getBugCreateData(0, false, null, null);
  }

  componentWillUnmount() {

  }

  componentWillUpdate(nextProps) {
    const tf = _.isEqual(this.props.visible, nextProps.visible);
    if (!tf) {
      this.loadUi = true;
    }
  }

	componentDidUpdate(prevProps) {
    const {bugAction} = this.props;
    if (this.props.createBugInfo && this.props.createBugInfo.id) {
      message.success('BUG 创建成功！');
      
      
      this.props.onOk(this.props.createBugInfo);

      bugAction.clearBugCreateUpdateInfo();
      return false;
    }

    if (this.props.error) {
      message.error(this.props.error);
      bugAction.clearErrors();
      return false;
    }
  }

  onOk() {
    PubSubMsg.publish('bug-save-create-win', { });
    
  }

  render() {

    let ui;
    if (this.loadUi) {
      ui = (<BugCreateForm
        productList={this.props.productList}
        projectList={this.props.projectList}
        taskList={this.props.taskList}
        storys={this.props.storys}
        users={this.props.users}
        builds={this.props.builds}
        modules={this.props.modules}
        bug={{}}
        bugAction={this.props.bugAction}
        productId={this.productId}
        isWin={true}
        />);
    }

    return (
      <div>
        <Modal title={<span>提Bug</span>}
          visible={this.props.visible}
          onOk={this.onOk.bind(this) } onCancel={this.props.onCancel}
          width="80%"
          maskClosable={false}>
          {ui}
        </Modal>
      </div>
    );
  }
}

BugCreateWin = Form.create()(BugCreateWin);

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
}))(BugCreateWin);