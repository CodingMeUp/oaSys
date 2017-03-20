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

class BugActive extends Component {
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
    const comment = window['win_editor_active'].html();
    const _this = this;

    Ajax.post({
      url: API.BUG_UPDATE_ACTIVE,
      data: {
        comment: comment,
        activatedCount : this.props.bug.activatedCount +1,
        bugId: this.props.bug.id,
        project: this.props.projectId,
        product: this.props.productId,
        assignedTo : this.props.form.getFieldValue('assignedTo'),
        openedBuild : this.props.form.getFieldValue('openedBuild')
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

      assignedToProps: getFieldProps('assignedTo', {
        initialValue: bug.resolvedBy,
        rules: [
          { required: true, message: '『指派』不能为空' }
        ]
      }),
      buildProps: getFieldProps('openedBuild', {
        rules: [
          { required: true, type: 'array',  message: '『轮数』不能为空' }
        ],
        initialValue: (bug.openedBuild ? bug.openedBuild.split(',').filter(function(item) {
          return item !== '' && item !== undefined && item !== null;
        }) : [])
      })

    };


    let ui;
    if (this.loadUi) {
      ui = (<Form horizontal form={this.props.form}>
             <FormItem
                  {...formItemLayout}
                  label="指派给"
                  >
                  <Select showSearch allowClear
                    optionFilterProp="searchValue"
                    notFoundContent="无法找到"
                    searchPlaceholder="输入名称/拼音/工号检索"
                    {...formProps.assignedToProps}>
                    {bugSelectOptions.usersOptions}
                  </Select>
                </FormItem>

           <FormItem
                  {...formItemLayout}
                  label="轮数"
                  >
                  <Select multiple={true} placeholder="轮数" {...formProps.buildProps}>
                    {bugSelectOptions.buildOptions}
                  </Select>
                </FormItem>

           <FormItem
          {...formItemLayout}
          label="备注"
          >
          <Editor editorId="win_editor_active" editorName="win_editor_active" />
        </FormItem>
      </Form>);
    }

    return (
      <div>
        <Modal title={<span><FAIcon type="fa-hand-o-right" /> {bug.id} {bug.title} → 激活并指派 </span>}
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

BugActive = Form.create()(BugActive);

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
}))(BugActive);