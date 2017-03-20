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
import BugUtils from '../BugUtils';
import _ from 'lodash';
import API from '../../API';
import PubSubMsg from '../../../framework/common/pubsubmsg';

const FormItem = Form.Item;

let uuid = 0;
class BugCreateForm extends Component {
  constructor(props) {
    super(props);
    this.selectOptions = BugUtils.getBugSelectOptions();
  }

  componentDidMount() {
    const _this = this;
    PubSubMsg.subscribe('bug-save-create-win', function (data) {
      _this.saveBug();
    });
  }

  componentWillUnmount() {
    PubSubMsg.unsubscribe('bug-save-create-win');
  }

  componentWillUpdate(nextProps) {

  }

  productChange(value, option) {
    const { bugAction } = this.props;
    // console.log(value, option);
    bugAction.getBugCreateData(value, true);
    this.props.form.resetFields(['module', 'project', 'openedBuild', 'task', 'story']);
  }

  projectChange(value, option) {
    const { bugAction } = this.props;
    bugAction.getBugCreateData(null, false, value);

    this.props.form.resetFields(['task']);
  }

  addUploadFile() {
    uuid++;
    const { form } = this.props;
    let keys = form.getFieldValue('keys');
    keys = keys.concat(uuid);
    form.setFieldsValue({
      keys,
    });
  }

  removeUploadFile(k) {
    const { form } = this.props;
    // can use data-binding to get
    let keys = form.getFieldValue('keys');
    if (keys.length 　> 1) {
      keys = keys.filter((key) => {
        return key !== k;
      });
      form.setFieldsValue({
        keys,
      });
    }
  }

  handleUploadChange(k, info) {
    if (info.file.status === 'done') {
      // console.log(info);
      message.success(`${info.file.name} 上传成功。`);
      var fieldValue = {};
      fieldValue['file_' + k] = info.file.response.data.name;
      fieldValue['file_url_' + k] = info.file.response.data.url;

      this.props.form.setFieldsValue(fieldValue);
    }
  }



  saveBug() {
    // console.log(window['editor_steps'].html());
 	  this.props.form.validateFields((errors, values) => {
      if (!!errors) {
        console.log('Errors in form!!!', errors);
        return;
      }
      values.steps = window['editor_steps'].html();

     	const { bugAction } = this.props;
      bugAction.createBug(values);
      this.props.form.resetFields();
      window['editor_steps'].html(`<p>[步骤]</p>
      <p>[结果]</p>
      <p>[期望]</p>`);
      this.props.form.setFieldsValue({
        project: values.project,
        product: values.product,
        openedBuild: values.openedBuild,
        module: values.module,
        stage:values.stage
      });
    });
  }

  render() {
    const { bugAction, bug } = this.props;
    const { getFieldProps, getFieldValue } = this.props.form;
    getFieldProps('keys', {
      initialValue: [0],
    });

    const _this = this;

    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 16 }
    };
    const fontWidthStyle = {
      width: 460
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
        initialValue: bug.title ? bug.title : null
      }),
      productProps: getFieldProps('product', {
        rules: [
          { required: true, type: 'number', message: '『所属产品』不能为空' }
        ]
      }),
      moduleProps: getFieldProps('module', {
        rules: [
          { required: true, type: 'number', message: '『所属模块』不能为空' }
        ],
        initialValue: bug.module ? bug.module : 0
      }),
      projectProps: getFieldProps('project', {
        rules: [
          { required: true, type: 'number', message: '『版本』不能为空' }
        ],
        initialValue: bug.project ? bug.project : null
      }),
      buildProps: getFieldProps('openedBuild', {
        rules: [
          { required: true, type: 'array', message: '『轮数』不能为空' }
        ],
        initialValue: bug.openedBuild ? bug.openedBuild.split(',') : []
      }),
      assignedToProps: getFieldProps('assignedTo', {
        initialValue: bug.assignedTo ? bug.assignedTo : null
      }),
      duty1Props: getFieldProps('duty1', {
        initialValue: bug.duty1 ? bug.duty1 : null
      }),
      stageProps: getFieldProps('stage', {
        rules: [
          { required: true, type: 'number', message: '『环境』不能为空' }
        ],
        initialValue: bug.stage ? bug.stage : 2
      }),
       platformProps: getFieldProps('platform', {
        rules: [
          { required: true, type: 'number', message: '『平台』不能为空' }
        ],
        initialValue: bug.platform ? bug.platform : 1
      }),
      taskProps: getFieldProps('task', {
        rules: [
          { type: 'number' }
        ],
        initialValue: bug.task ? bug.task : null
      }),
      storyProps: getFieldProps('story', {
        rules: [
          { type: 'number' }
        ],
        initialValue: bug.story ? bug.story : null
      }),
      severityProps: getFieldProps('severity', {
        initialValue: bug.severity ? bug.severity : 3
      }),
      typeProps: getFieldProps('type', {
        initialValue: bug.type ? bug.type : 'codeerror'
      }),
      mailtoProps: getFieldProps('mailto', {
        initialValue: bug.mailto ? bug.mailto.split(',') : []
      }),
       linkedProductProps: getFieldProps('linkedProduct', {
        initialValue : bug.linkedProduct?bug.linkedProduct.split(',').map( x=> +x ):[]
      }),
      osProps: getFieldProps('os', {
        initialValue: bug.os ? bug.os : ''
      }),
      browserProps: getFieldProps('browser', {
        initialValue: bug.browser ? bug.browser : ''
      }),
     lostTestProps: getFieldProps('lostTest', {
      rules: [
          { required: true, type: 'number', message: '『是否漏测』不能为空' }
        ],
        initialValue: bug.lostTest ? bug.lostTest : ''
      }),
       discoveryPhaseProps: getFieldProps('discoveryPhase', {
      rules: [
          { required: true, type: 'number', message: '『发现阶段』不能为空' }
        ],
        initialValue: bug.discoveryPhase ? bug.discoveryPhase : ''
      }),
      difficultyProps: getFieldProps('difficulty', {
        rules: [
          { required: true, type: 'number', message: '『难易程度』不能为空' }
        ],
        initialValue: bug.difficulty ? bug.difficulty : null
      }),
      priProps: getFieldProps('pri', {
        rules: [
          { required: true, type: 'number', message: '『优先级』不能为空' }
        ],
        initialValue: bug.pri ? bug.pri : null
      }),
      keywordsProps: getFieldProps('keywords', {
        initialValue: bug.keywords ? bug.keywords : ''
      }),
    }
    const bugStepsTemp = bug.steps ? bug.steps : `<p>[步骤]</p>
      <p>[结果]</p>
      <p>[期望]</p>`;


    const uploadBtn = k => {
      return (
        <span>
          <Upload
            name="file"
            showUploadList={false}
            onChange={_this.handleUploadChange.bind(_this, k) }
            action={API.BUG_UPLOAD_FILE + '?k=' + k}>
            <Button type="primary">
              <FAIcon type="fa-upload" /> 点击上传
            </Button>
          </Upload>
        </span>
      );
    };
    const uploadAddDeleteBtn = k => {
      return (
        <span>
          <Button onClick={() => this.addUploadFile(k) } type="primary"><FAIcon type="fa-plus" /> 增加</Button>
          <span style={{ paddingLeft: 5 }}> </span>
          <Button onClick={() => this.removeUploadFile(k) }><FAIcon type="fa-minus" /> 删除</Button>
        </span>
      );
    };
    const formFileItems = getFieldValue('keys').map((k) => {
      return (
        <Form.Item {...formItemLayout} label={`附件(${k + 1})：`} key={k} className="uploadFormItem">
          <Input addonBefore={uploadBtn(k) } addonAfter={uploadAddDeleteBtn(k) } placeholder="附件标题" {...getFieldProps(`file_${k}`) } />
          <Input style={{ display: 'none' }} {...getFieldProps(`file_url_${k}`) } />
        </Form.Item>
      );
    });

    const displayStyle = this.props.isWin ? { display: 'none' } : { display: 'block' };
    const bugCreateStyle = this.props.isWin ? { padding: 0, maxHeight: 500, overflow: 'auto', border: 'none' } : {};

    return (
      <div>
        <div className="bug-create" style={bugCreateStyle}>
          <div className="bug-create-content">
            <h2 style={displayStyle}>提Bug</h2>
            <div className="form">
              <Form horizontal form={this.props.form}>
                <FormItem
                  {...formItemLayout}
                  label="产品模块"
                  hasFeedback
                  required
                  >
                  <Select
                    onSelect={this.productChange.bind(this) }
                    showSearch={true}
                    placeholder="请选择产品"
                    optionFilterProp="searchValue"
                    notFoundContent="无法找到"
                    searchPlaceholder="输入产品名称检索"
                    style={fontWidthStyle}
                    {...formProps.productProps}>
                    {bugSelectOptions.productOptions}
                  </Select>

                  <Select
                    style={{ width: 260, marginLeft: 10 }}
                    {...formProps.moduleProps}>
                    {bugSelectOptions.moduleOptions}
                  </Select>
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="版本"
                  hasFeedback
                  required
                  >
                  <Select
                    onSelect={this.projectChange.bind(this) }
                    allowClear={true}
                    showSearch={true}
                    placeholder="请选择项目"
                    optionFilterProp="searchValue"
                    notFoundContent="无法找到"
                    searchPlaceholder="输入项目名称检索"
                    style={fontWidthStyle}
                    {...formProps.projectProps}>
                    {bugSelectOptions.projectOptions}
                  </Select>
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="轮数"
                  hasFeedback
                  required
                  >
                  <Select multiple={true} placeholder="轮数" style={fontWidthStyle} {...formProps.buildProps}>
                    {bugSelectOptions.buildOptions}
                  </Select>
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="当前指派"
                  hasFeedback
                  >
                  <Select
                    showSearch={true}
                    placeholder="请选择当前指派"
                    optionFilterProp="searchValue"
                    notFoundContent="无法找到"
                    searchPlaceholder="输入名称/拼音/工号检索"
                    style={fontWidthStyle}
                    {...formProps.assignedToProps}>
                    {bugSelectOptions.usersOptions}
                  </Select>
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="Bug责任人"
                  hasFeedback
                  >
                  <Select
                    showSearch={true}
                    placeholder="请选择Bug责任人"
                    optionFilterProp="searchValue"
                    notFoundContent="无法找到"
                    searchPlaceholder="输入名称/拼音/工号检索"
                    style={fontWidthStyle}
                    {...formProps.duty1Props}>
                    {bugSelectOptions.usersOptions}
                  </Select>
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="环境"
                  hasFeedback
                  required
                  >
                  <Select
                    style={fontWidthStyle}
                    {...formProps.stageProps}>
                    {this.selectOptions.stageOptions}
                  </Select>
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="平台"
                  hasFeedback
                  required
                  >
                  <Select
                    style={fontWidthStyle}
                    {...formProps.platformProps}>
                    {this.selectOptions.platformOptions}
                  </Select>
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="Bug标题"
                  hasFeedback
                  required
                  >
                  <Input {...formProps.titleProps}/>
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="重现步骤"
                  hasFeedback
                  >
                  <Editor editorId="editor_steps" editorName="editor_steps" editorHtml={bugStepsTemp} />
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="相关需求"
                  hasFeedback
                  >
                  <Select allowClear {...formProps.storyProps}>
                    {bugSelectOptions.storyOptions}
                  </Select>
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="相关任务"
                  hasFeedback
                  >
                  <Select allowClear {...formProps.taskProps}>
                    {bugSelectOptions.taskOptions}
                  </Select>
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="类型/严重程度"
                  hasFeedback
                  >
                  <Select
                    style={{ width: 260 }}
                    {...formProps.typeProps}>
                    {this.selectOptions.typeOptions}
                  </Select>

                  <Select
                    style={{ width: 260, marginLeft: 10 }}
                    {...formProps.severityProps}>
                    {this.selectOptions.severityOptions}
                  </Select>
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="系统/浏览器"
                  hasFeedback
                  >
                  <Select style={{ width: 260 }} {...formProps.osProps}>
                    {this.selectOptions.osOptions}
                  </Select>

                  <Select style={{ width: 260, marginLeft: 10 }} {...formProps.browserProps}>
                    {this.selectOptions.browserOptions}
                  </Select>
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="难易程度"
                  hasFeedback
                  required
                  >
                  <Select style={{ width: 530 }} {...formProps.difficultyProps}>
                    {this.selectOptions.difficultyOptions}
                  </Select>
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="优先级"
                  hasFeedback
                  required
                  >
                  <Select style={{ width: 530 }} {...formProps.priProps}>
                    {this.selectOptions.priOptions}
                  </Select>
                </FormItem>
                 <FormItem
                  {...formItemLayout}
                  label="是否漏测"
                  hasFeedback
                  >
                  <Select style={{ width: 530 }} {...formProps.lostTestProps}>
                    {this.selectOptions.lostTestOptions}
                  </Select>
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="发现阶段"
                  hasFeedback
                  >
                  <Select style={{ width: 530 }} {...formProps.discoveryPhaseProps}>
                    {this.selectOptions.discoveryPhaseOptions}
                  </Select>
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="关联产品"
                  hasFeedback
                  >
                  <Select
                    showSearch={true}
                    multiple={true}
                    placeholder="选择关联产品"
                    optionFilterProp="searchValue"
                    notFoundContent="无法找到"
                    searchPlaceholder="输入名称/拼音检索"
                    {...formProps.linkedProductProps}>
                    {bugSelectOptions.productOptions}
                  </Select>
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="抄送给"
                  hasFeedback
                  >
                  <Select
                    showSearch={true}
                    multiple={true}
                    placeholder="请选择抄送人"
                    optionFilterProp="searchValue"
                    notFoundContent="无法找到"
                    searchPlaceholder="输入名称/拼音/工号检索"
                    {...formProps.mailtoProps}>
                    {bugSelectOptions.usersOptions}
                  </Select>
                </FormItem>

                <FormItem
                  {...formItemLayout}
                  label="关键词"
                  hasFeedback
                  >
                  <Input {...formProps.keywordsProps}/>
                </FormItem>
                {formFileItems}
                <span  style={displayStyle}>
                  <FormItem
                    {...formItemLayout}
                    label=" "
                    >
                    <Button type="primary" onClick={this.saveBug.bind(this) }>保存</Button>

                    <Button style={{ marginLeft: 10 }} onClick={this.props.goBack }>返回</Button>
                  </FormItem>
                </span>
              </Form>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

BugCreateForm = Form.create()(BugCreateForm);

export default BugCreateForm;
