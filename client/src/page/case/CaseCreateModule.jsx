import React from 'react';
import reqwest from 'reqwest';
import { Breadcrumb, Popconfirm, Table, message, Modal, Input, InputNumber, Checkbox, Form, Button, Icon, Tooltip, Tag, Menu, Dropdown  } from 'antd'
import Page from '../../framework/page/Page';
import API from '../API';
import PubSubMsg from '../../framework/common/pubsubmsg';
import Funs from '../../framework/common/functions';
import Storage from '../../framework/common/storage';

const FormItem = Form.Item;
const createForm = Form.create;
const top_current_project = Funs.top_current_project +'_'+_USERINFO.userId;
let CaseCreateModule = React.createClass({
  stateValue: {},
  getInitialState() {
    return {
      data: [],
      modalTitle: '新增模块',
    }
  },
  componentWillUnmount() {
    PubSubMsg.unsubscribe('refresh-tree-data-module')
  },
  componentDidMount() {
    const _this = this;
    PubSubMsg.subscribe('refresh-tree-data-module', function (data) {
      _this.props.form.setFieldsValue({
        projectName: data.modualName,
        sort: data.modalSort, //（不懂次处排序为啥没有使用）
        // sort: 0,
        projectRemark: data.moduleDesc

      });
    });
  },
  //Modal 保存
  handleOk() {
    let _this = this;
    let url = '';
    let method = '';

    
    if (_this.props.modualAction == 'module_edit') {

      _this.stateValue.sort = _this.props.form.getFieldValue('sort');
      _this.stateValue.moduleName = _this.props.form.getFieldValue('projectName');
      _this.stateValue.moduleDesc = _this.props.form.getFieldValue('projectRemark');
      _this.stateValue._id = _this.props.modualId;
      _this.stateValue.project = _this.props.modalProjectId;
      //_this.stateValue.parentId = _this.props.modalParentId;
      _this.props.form.validateFields((errors, values) => {
        if (!!errors) {
          return;
        } else {
          reqwest({
            url: API.PROJECT_MODULE_POST,
            method: 'post',
            contentType: 'application/json',
            data: JSON.stringify(_this.stateValue),
            type: 'json',
            success: (result) => {
              _this.stateValue = {};
              message.success('成功完成', 2);
              PubSubMsg.publish('refresh-tree-data', { rowId: _this.props.modualId,projectId:_this.props.modalProjectId});
               this.props.modalCancel();
            }
          });
        }
      });

    } else if (_this.props.modualAction == 'module_add') {
      _this.stateValue.sort = _this.props.form.getFieldValue('sort');
      _this.stateValue.moduleName = _this.props.form.getFieldValue('projectName');
      _this.stateValue.moduleDesc = _this.props.form.getFieldValue('projectRemark');
      _this.stateValue._id = '';
      _this.stateValue.project = _this.props.modalProjectId;
      _this.stateValue.parentId = _this.props.modalParentId;      
      //add by dwq on 2016/11/08 for 新产品流程下新增右键添加模块
      _this.stateValue.type = Storage.local.get(top_current_project) ? Storage.local.get(top_current_project).type : null;  
      if(_this.stateValue.type && _this.stateValue.type ==='product'){
        _this.stateValue.pmsProductId = Storage.local.get(top_current_project) ? Funs.decrypt(Storage.local.get(top_current_project).currentProject, Funs.secret) : null
      }
      _this.props.form.validateFields((errors, values) => {
        if (!!errors) {
          return;
        } else {
          reqwest({
            url: API.PROJECT_MODULE_PUT,
            method: 'put',
            contentType: 'application/json',
            data: JSON.stringify(_this.stateValue),
            type: 'json',
            success: (result) => {
              message.success('成功完成', 2);
              PubSubMsg.publish('refresh-tree-data', { rowId: _this.stateValue.parentId ,projectId:_this.props.modalProjectId});
              this.props.modalCancel();
              _this.stateValue = {};
            }
          });
        }
      });
    }


  },
  // Modal 取消
  handleCancel(e) {
    this.props.modalCancel();
  },
  render() {
    const { getFieldProps } = this.props.form;

    const projectNameProps = getFieldProps('projectName', {
      rules: [
        { required: true, message: '模块名称必填', type: "string" }
      ],
    });
    const sortProps = getFieldProps('sort', {
      rules: [
        { required: false, message: '排序', type: "number" }
      ],
    });

    const projectRemarkProps = getFieldProps('projectRemark', {
      rules: [
        { required: false, message: '描述', type: 'string' }
      ],
    });
    return (

      <Modal maskClosable={false} title={this.props.modualTitle} width={610} visible={this.props.modalVisible}
        onOk={this.handleOk} onCancel={this.handleCancel}>
        <div className="caseCreatMouleForm">
        <Form horizontal form={this.props.form}>
          <FormItem label="名称：">
            <Input  {...projectNameProps} style={{ width: 580 }}/>
          </FormItem>
        </Form>

        <Form horizontal>
          <FormItem label="排序：">
            <InputNumber {...sortProps}   style={{ width: 580 }} min={0} max={111} />
          </FormItem>
        </Form>

        <Form horizontal>
          <FormItem label="描述：">
            <textarea  {...projectRemarkProps} style={{ maxWidth: 580, width: 580 }}/>
          </FormItem>
        </Form>
        </div>
      </Modal>

    );
  }
});

CaseCreateModule = createForm()(CaseCreateModule);
export default CaseCreateModule;
