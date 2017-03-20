import '../style.bug.less';
import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { browserHistory, Router, Route, Link } from 'react-router';
import { connect } from 'react-redux';
import moment from 'moment';
import FAIcon from '../../../framework/faicon/FAIcon';
import { Breadcrumb, Button, Menu, Icon, Tree, Tooltip, Spin, message, Modal, Select, Dropdown, Table, Tabs, Form, Input, Upload,DatePicker } from 'antd';
import * as BugAction from '../../../actions/bugs';
import Editor from '../../utils/Editorer';
import BUG_LANG from '../BugLang';
import BugUtils from '../BugUtils';
import _ from 'lodash';
import API from '../../API';
import Ajax from '../../../framework/common/ajax';
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const TreeNode = Tree.TreeNode;
const TabPane = Tabs.TabPane;
const Option = Select.Option;
const FormItem = Form.Item;

class BugClosed extends Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {

  }
  componentWillMount(){

  }
  componentWillUnmount() {

  }

  componentWillUpdate(nextProps) {
    const tf = _.isEqual(this.props.visible, nextProps.visible);
    // console.log(nextProps, this.props, !tf);  
    if (!tf) {
      this.loadUi = true;
    }
  }

  onOk() {
    const comment = window['win_editor_closed'].html();
    const _this = this;

    Ajax.post({
      url: API.BUG_UPDATE_CLOSED,
      data: {
        comment: comment,
           bugId: this.props.bug.id,
        project: this.props.projectId,
        product: this.props.productId
      },
      success(res) {
        const result = res.body;

        if (result.status === 200) {
          message.info(result.message);
          _this.props.onOk();
        } else {
          message.error(result.message);
        }

        _this.setState({
          modalVisible: false
        })
      }
    })
  }

  render() {
    const formItemLayout = {
      labelCol: { span: 2 },
      wrapperCol: { span: 22 }
    };
    const { getFieldProps, getFieldValue, getFieldError, isFieldValidating } = this.props.form;
    const { bugAction, bug } = this.props;
    const  bugSelectOptions = BugUtils.getBugOtherSelectOptions(
                    this.props.productList, 
                    this.props.projectList, 
                    this.props.taskList,  
                    this.props.storys, 
                    this.props.users, 
                    this.props.builds,
                    this.props.modules);

    const formProps = {
 
      // assignedToProps: getFieldProps('assignedTo', {
      //   // initialValue: bug.assignedTo
      //   rules: [
      //     { required: true, message: '『指派』不能为空' }
      //   ]
      // }),

      // mailtoProps: getFieldProps('mailto', {
      //   // initialValue: (bug.mailto ? bug.mailto.split(',').filter(function(item) {
      //   //   return item !== '' && item !== undefined && item !== null;
      //   // }) : [])
      // }),
   
    };


    let ui;
    if (this.loadUi) {
      ui = (<Form horizontal form={this.props.form}>
            
           <FormItem
          {...formItemLayout}
          label="备注"
          >
          <Editor editorId="win_editor_closed" editorName="win_editor_closed" />
        </FormItem>
      </Form>);
    }

    return (
      <div>
        <Modal title={<span><FAIcon type="fa-hand-o-right" /> {bug.id} {bug.title} → 关闭 </span>}
          visible={this.props.visible}
          onOk={this.onOk.bind(this) } onCancel={this.props.onCancel}
          width="60%"
          maskClosable={false}>
          {ui}
        </Modal>
      </div>
    );
  }
}

BugClosed = Form.create()(BugClosed);

export default connect((state, props) => ({
  bug: state.bugedit.bug,
  users: state.bugedit.users,
  actions: state.bugedit.actions,
  productList: state.bugedit.productList,
  projectList: state.bugedit.projectList,
  taskList: state.bugedit.taskList,
  builds: state.bugedit.builds,
  modules: state.bugedit.modules,
  storys: state.bugedit.storys,
  pageLoading: state.bugedit.pageLoading,
  updateBugInfo: state.bugedit.updateBugInfo,
  error: state.bugedit.error
}), dispatch => ({
  bugAction: bindActionCreators(BugAction, dispatch)
}))(BugClosed);