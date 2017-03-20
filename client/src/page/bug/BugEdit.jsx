import './style.bug.less';
import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { browserHistory, Router, Route, Link } from 'react-router';
import { connect } from 'react-redux';
import moment from 'moment';
import FAIcon from '../../framework/faicon/FAIcon';
import { Breadcrumb, Button, Menu, Icon, Tree, Tooltip, Spin, message, Modal, Select, Dropdown, Table, Tabs, Form, Input, DatePicker } from 'antd';
import Page from '../../framework/page/Page';
import * as BugAction from '../../actions/bugs';
import UiCtrl from '../utils/UiCtrl';
import BUG_LANG from './BugLang';
import BugUtils from './BugUtils';
import _ from 'lodash';
import $ from 'jquery';
import classNames from 'classnames';
import Editor from '../utils/Editorer';

const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const TreeNode = Tree.TreeNode;
const TabPane = Tabs.TabPane;
const Option = Select.Option;
const FormItem = Form.Item;


class BugEdit extends Component {
  constructor(props) {
    super(props);
    this.selectOptions = BugUtils.getBugSelectOptions();
  }

  componentDidMount() {
    const { bugAction, location, routeParams } = this.props;
    const bugId = routeParams.id;
    if (+bugId) {
      bugAction.getBugById(bugId, true);
    }

    BugUtils.addHistoryJQueryOperationt();


  }

  componentWillUnmount() {
    document.title = '用例管理';
    $('body').unbind("click");
  }

  componentDidUpdate(prevProps) {
    const {bugAction, routeParams} = this.props;
    if (this.props.updateBugInfo && this.props.updateBugInfo.id) {
      message.success('BUG 更新成功！');
      this.context.router.push('/bug/view/' + routeParams.id + '?from=edit');
      bugAction.clearBugCreateUpdateInfo();
      return false;
    }

    if (this.props.error) {
      message.error(this.props.error);
      bugAction.clearErrors();
      return false;
    }
  }

  saveEdit() {
    const { bugAction, location, routeParams } = this.props;
    const bugId = routeParams.id;

    this.props.form.validateFields((errors, values) => {
      if (!!errors) {
        console.log('Errors in form!!!', errors);
        return;
      }
      values.steps = window['editor_steps_edit'].html().replace(/<\/p>/g, '</p>\n');
      values.comment = window['editor_comment'].html();
      values.bugId = bugId;


      if(values.closedBy ){
        if( !values.resolution){
             alert('关闭时，『解决方案』不能为空!')
             console.log('关闭时，『解决方案』不能为空!');
             return;
        }
      }


     	const { bugAction } = this.props;

      bugAction.updateBug(values);
    });
  }

  productChange(value, option) {
    const { bugAction } = this.props;
    // console.log(value, option);
    bugAction.getBugCreateData(value, true);
    this.props.form.setFieldsValue({
      module: 0,
      project: null,
      openedBuild: [],
      resolvedBuild: null,
      task: null,
      story: null
    });
  }

  projectChange(value, option) {
    const { bugAction } = this.props;
    bugAction.getBugCreateData(null, false, value);

 	  this.props.form.setFieldsValue({
      task: null
    });
  }

  goBack() {
    this.context.router.goBack();
  }

  checkResolution(rule, value, callback) {
    const resolvedBy = this.props.form.getFieldValue('resolvedBy');
    if (resolvedBy && !value) {
      callback(new Error('『解决方案』不能为空!'));
    } else {
      callback();
    }

  }

  render() {
    const { bugAction, bug } = this.props;
    const { getFieldProps, getFieldValue, getFieldError, isFieldValidating } = this.props.form;

    const _this = this;


    const pageHeader =
      <div>
        <h1 className="admin-page-header-title">
          BUG编辑
        </h1>
        <Breadcrumb>
          <Breadcrumb.Item>
            <Icon type="home" />
            首页
          </Breadcrumb.Item>
          <Breadcrumb.Item>BUG管理</Breadcrumb.Item>
          <Breadcrumb.Item>BUG编辑</Breadcrumb.Item>
        </Breadcrumb>
      </div>;
    if (!_.isEmpty(bug)) {
      document.title = bug.title;
    }

    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 }
    };
    const bugSelectOptions = BugUtils.getBugOtherSelectOptions(
      this.props.productList,
      this.props.projectList,
      this.props.taskList,
      this.props.storys,
      this.props.users,
      this.props.builds,
      this.props.modules);
    const formProps = {
      titleProps: getFieldProps('title', {
        rules: [
          { required: true, message: '『BUG标题』不能为空' }
        ],
        initialValue: bug.title
      }),
      productProps: getFieldProps('product', {
        rules: [
          { required: true, type: 'number', message: '『所属产品』不能为空' }
        ],
        initialValue: bug.product
      }),
      moduleProps: getFieldProps('module', {
        rules: [
          { required: true, type: 'number', message: '『所属模块』不能为空' }
        ],
        initialValue: bug.module
      }),
      platformProps: getFieldProps('platform', {
        rules: [
          { required: true, type: 'number', message: '『平台』不能为空' }
        ],
        initialValue: bug.platform
      }),
       discoveryPhaseProps: getFieldProps('discoveryPhase', {
        rules: [
          { required: true, type: 'number', message: '『发现阶段』不能为空' }
        ],
        initialValue: bug.discoveryPhase
      }),
      projectProps: getFieldProps('project', {
        rules: [
          { required: true, type: 'number', message: '『版本』不能为空' }
        ],
        initialValue: (bug.project ? bug.project : null)
      }),
      taskProps: getFieldProps('task', {
        rules: [
          { type: 'number' }
        ],
        initialValue: (bug.task ? bug.task : null)
      }),
      buildProps: getFieldProps('openedBuild', {
        rules: [
          { required: true, type: 'array',  message: '『轮数』不能为空' }
        ],
        initialValue: (bug.openedBuild ? bug.openedBuild.split(',').filter(function(item) {
          return item !== '' && item !== undefined && item !== null;
        }) : [])
      }),
      resolvedBuildProps: getFieldProps('resolvedBuild', {

        initialValue: (bug.resolvedBuild ? bug.resolvedBuild : '')
      }),
      duty1Props: getFieldProps('duty1', {
        initialValue: bug.duty1
      }),
      assignedToProps: getFieldProps('assignedTo', {
        initialValue: bug.assignedTo
      }),
      resolvedByProps: getFieldProps('resolvedBy', {
        initialValue: bug.resolvedBy
      }),
      closedByProps: getFieldProps('closedBy', {
        initialValue: bug.closedBy
      }),
      mailtoProps: getFieldProps('mailto', {
        initialValue: (bug.mailto ? bug.mailto.split(',').filter(function(item) {
          return item !== '' && item !== undefined && item !== null;
        }) : [])
      }),
      linkedProductProps: getFieldProps('linkedProduct', {
        initialValue : bug.linkedProduct?bug.linkedProduct.split(',').map( x=> +x ):[]
      }),
      keywordsProps: getFieldProps('keywords', {
        initialValue: bug.keywords ? bug.keywords : ''
      }),
      stageProps: getFieldProps('stage', {
          rules: [
          { required: true, type: 'number', message: '『环境』不能为空' }
        ],
         initialValue: bug.stage
      }),
      severityProps: getFieldProps('severity', {
        initialValue: bug.severity
      }),
      typeProps: getFieldProps('type', {
        initialValue: bug.type
      }),
      lostTestProps: getFieldProps('lostTest', {
         rules: [
          { required: true, type: 'number', message: '『是否漏测』不能为空' }
        ],
        initialValue: bug.lostTest
      }),
      osProps: getFieldProps('os', {
        initialValue: bug.os
      }),
      browserProps: getFieldProps('browser', {
        initialValue: bug.browser
      }),
      difficultyProps: getFieldProps('difficulty', {
          rules: [
          { required: true, type: 'number', message: '『难易程度』不能为空' }
        ],
         initialValue: bug.difficulty
      }),
      priProps: getFieldProps('pri', {
        rules: [
          { required: true, type: 'number', message: '『优先级』不能为空' }
        ],
         initialValue: bug.pri
      }),
      statusProps: getFieldProps('status', {
        initialValue: bug.status
      }),
      confirmedProps: getFieldProps('confirmed', {
        initialValue: bug.confirmed
      }),
      resolvedDateProps: getFieldProps('resolvedDate', {
        initialValue: bug.resolvedDate
      }),
      closedDateProps: getFieldProps('closedDate', {
        initialValue: bug.closedDate
      }),
      resolutionProps: getFieldProps('resolution', {
        rules: [
          {
            message: '『解决方案』不能为空',
          }, {
            validator: this.checkResolution.bind(this),
          },
        ],
        initialValue: bug.resolution
      }),
      linkBugProps: getFieldProps('linkBug', {
        initialValue: bug.linkBug
      }),
      caseProps: getFieldProps('case', {
        initialValue: bug.case
      }),
    };
    const actionHistorys = BugUtils.actionHistorys(this.props.actions);
    const historyIcon = classNames({
      'icon': true,
      'openOrClose': true
    });

    return (
      <Page header={pageHeader} loading={this.props.pageLoading} unShowPageAnimate={true}>
        <div className="bug-view-header">
          <ul className="floatRight">
            <div style={{ marginTop: 5 }}><Button type="primary" onClick={this.saveEdit.bind(this)}> 保 存 </Button></div>
          </ul>
          <h2><span className="bugId">{bug.id}</span> {bug.title}</h2>
        </div>

        <div className="bug-view-content">
          <div className="bug-view-right">
            <fieldset style={{ marginTop: 0 }}>
              <legend>基本信息</legend>
              <Form horizontal form={this.props.form}>
                <FormItem
                  {...formItemLayout}
                  label="所属产品"
                  hasFeedback
                  >
                  <Select
                    onSelect={this.productChange.bind(this) }
                    showSearch={true}
                    placeholder="请选择产品"
                    optionFilterProp="searchValue"
                    notFoundContent="无法找到"
                    searchPlaceholder="输入产品名称检索"
                    {...formProps.productProps}>
                    {bugSelectOptions.productOptions}
                  </Select>
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="所属模块"
                  hasFeedback
                  >
                  <Select
                    {...formProps.moduleProps}>
                    {bugSelectOptions.moduleOptions}
                  </Select>
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="所属计划"
                  hasFeedback
                  >
                  <Select showSearch={true}>

                  </Select>
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="Bug类型"
                  >
                  <Select {...formProps.typeProps}>
                    {this.selectOptions.typeOptions}
                  </Select>
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="严重程度"
                  >
                  <Select {...formProps.severityProps}>
                    {this.selectOptions.severityOptions}
                  </Select>
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="环境"
                  >
                  <Select {...formProps.stageProps}>
                    {this.selectOptions.stageOptions}
                  </Select>
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="平台"
                  >
                  <Select {...formProps.platformProps}>
                    {this.selectOptions.platformOptions}
                  </Select>
                </FormItem>
                      <FormItem
                  {...formItemLayout}
                  label="难易程度"
                  >
                  <Select {...formProps.difficultyProps}>
                    {this.selectOptions.difficultyOptions}
                  </Select>
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="优先级"
                  >
                  <Select {...formProps.priProps}>
                    {this.selectOptions.priOptions}
                  </Select>
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="是否漏测"
                  >
                  <Select {...formProps.lostTestProps}>
                    {this.selectOptions.lostTestOptions}
                  </Select>
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="发现阶段"
                  >
                  <Select {...formProps.discoveryPhaseProps}>
                    {this.selectOptions.discoveryPhaseOptions}
                  </Select>
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="Bug责任人"
                  >
                  <Select showSearch allowClear
                    optionFilterProp="searchValue"
                    notFoundContent="无法找到"
                    searchPlaceholder="输入名称/拼音/工号检索"
                    {...formProps.duty1Props}>
                    {bugSelectOptions.usersOptions}
                  </Select>
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="Bug状态"
                  >
                  <Select {...formProps.statusProps}>
                    {this.selectOptions.statusOptions}
                  </Select>
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="是否确认"
                  >
                  <Select {...formProps.confirmedProps}>
                    {this.selectOptions.confirmedOptions}
                  </Select>
                </FormItem>
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
                  label="操作系统"
                  >
                  <Select {...formProps.osProps}>
                    {this.selectOptions.osOptions}
                  </Select>
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="浏览器"
                  >
                  <Select {...formProps.browserProps}>
                    {this.selectOptions.browserOptions}
                  </Select>
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="关键词"
                  >
                  <Input {...formProps.keywordsProps}/>
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="抄送给"
                  >
                  <Select showSearch allowClear multiple
                    optionFilterProp="searchValue"
                    notFoundContent="无法找到"
                    searchPlaceholder="输入名称/拼音/工号检索"
                    {...formProps.mailtoProps}>
                    {bugSelectOptions.usersOptions}
                  </Select>
                </FormItem>
              </Form>
            </fieldset>

            <fieldset>
              <legend>项目/需求/任务</legend>
              <Form horizontal form={this.props.form}>
                <FormItem
                  {...formItemLayout}
                  label="版本"
                  >
                  <Select
                    onSelect={this.projectChange.bind(this) }
                    allowClear={true}
                    showSearch={true}
                    placeholder="请选择项目"
                    optionFilterProp="searchValue"
                    notFoundContent="无法找到"
                    searchPlaceholder="输入项目名称检索"
                    {...formProps.projectProps}>
                    {bugSelectOptions.projectOptions}
                  </Select>
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="相关任务"
                  >
                  <Select allowClear {...formProps.taskProps}>
                    {bugSelectOptions.taskOptions}
                  </Select>
                </FormItem>
              </Form>
            </fieldset>

            <fieldset>
              <legend>BUG的一生</legend>
              <Form horizontal form={this.props.form}>
                <FormItem
                  {...formItemLayout}
                  label="由谁创建"
                  >
                  <span>{bug.openedByRealname}</span>
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
                  label="解决者"
                  >
                  <Select showSearch allowClear
                    optionFilterProp="searchValue"
                    notFoundContent="无法找到"
                    searchPlaceholder="输入名称/拼音/工号检索"
                    {...formProps.resolvedByProps}>
                    {bugSelectOptions.usersOptions}
                  </Select>
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="解决日期"
                  >
                  <DatePicker {...formProps.resolvedDateProps} />
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="解决版本"
                  >
                  <Select  placeholder="解决版本" {...formProps.resolvedBuildProps}>
                    {bugSelectOptions.buildOptions}
                  </Select>
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="解决方案"
                  >
                  <Select {...formProps.resolutionProps}>
                    {this.selectOptions.resolutionOptions}
                  </Select>
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="由谁关闭"
                  >
                  <Select showSearch allowClear
                    optionFilterProp="searchValue"
                    notFoundContent="无法找到"
                    searchPlaceholder="输入名称/拼音/工号检索"
                    {...formProps.closedByProps}>
                    {bugSelectOptions.usersOptions}
                  </Select>
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="关闭日期"
                  >
                  <DatePicker {...formProps.closedDateProps} />
                </FormItem>
              </Form>
            </fieldset>
            <fieldset>
              <legend>其他相关</legend>
              <Form horizontal form={this.props.form}>
                  <FormItem
                  {...formItemLayout}
                  label="关联产品"
                  >
                  <Select showSearch allowClear multiple
                    optionFilterProp="searchValue"
                    notFoundContent="无法找到"
                    searchPlaceholder="输入名称/拼音检索"
                    {...formProps.linkedProductProps}>
                    {bugSelectOptions.productOptions}
                  </Select>
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="相关Bug"
                  >
                  <Input {...formProps.linkBugProps} />
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="相关用例"
                  >
                  <Input {...formProps.caseProps} />
                </FormItem>
              </Form>
            </fieldset>
          </div>

          <div className="bug-view-left">
            <div>
              <Input {...formProps.titleProps} />
            </div>
            <fieldset>
              <legend>重现步骤</legend>
              <div>
                <Editor editorId="editor_steps_edit" editorName="editor_steps_edit" editorHtml={bug.steps} />
              </div>
            </fieldset>
            <fieldset>
              <legend>备注</legend>
              <div>
                <Editor editorId="editor_comment" editorName="editor_comment" />
              </div>
            </fieldset>
            <div style={{textAlign: 'center'}}>
              <Button type="primary" onClick={this.saveEdit.bind(this)} style={{marginRight: 10}}> 保 存 </Button>
              <Button onClick={this.goBack.bind(this)}> 返 回 </Button>
            </div>
            <fieldset>
              <legend>附件</legend>

            </fieldset>
            <fieldset>
              <legend>
                历史记录
                <span className="icon"><FAIcon type="fa-arrow-down" /></span>
                <span className={historyIcon}><FAIcon type="fa-plus" /></span>
              </legend>
              <div>
                <ol className='historyItem'>
                  {actionHistorys}
                </ol>
              </div>
            </fieldset>
          </div>
        </div>
      </Page>
    );

  }

}

BugEdit.contextTypes = {
  router: React.PropTypes.object.isRequired
};

BugEdit = Form.create()(BugEdit);


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
}))(BugEdit);