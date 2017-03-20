import './style.less';
import React from 'react';
import { Select, message, Form, Input, InputNumber, Modal, Checkbox, Spin } from 'antd'
import * as _ from 'lodash';
import API from '../API';
import Ajax from '../../framework/common/ajax';
import UserSelect from './UserSelect';
import Storage from '../../framework/common/storage';
import PubSubMsg from '../../framework/common/pubsubmsg';

const CheckboxGroup = Checkbox.Group;
const FormItem = Form.Item;
const createForm = Form.create;

let CaseDoEdit = React.createClass({
  stateValue: {

  },
  getInitialState() {
    return {
      loading: true,
      levelValue: [],
      confirmSaveEditLoading: false,
      saveEditModalVisible: this.props.saveEditModalVisible
    }
  },
  componentWillUnmount() {

  },
  componentDidMount() {
  },
  componentWillReceiveProps: function (nextProps) {
    const _this = this;
    if (!_.isEqual(nextProps.doCaseId, this.props.doCaseId)) {
      this.setState({
        saveEditModalVisible: nextProps.saveEditModalVisible
      }, () => {
        _this.ajax = Ajax.get({
          url: API.CASE_DO_INFO_BY_ID,
          data: {
            id: _this.props.doCaseId
          },
          success(res) {
            const result = res.body;

            if (result.status === 200) {
              const data = result.data;
              _this.props.form.setFieldsValue({
                douser: data.user,
                doversion: data.version,
                dotimes: parseInt(data.times)
              });
              _this.setState({
                loading: false,
                levelValue: data ? data.levels.split(',') : []
              })
            }
          }
        })
      });
    } else {
      this.setState({
        saveEditModalVisible: nextProps.saveEditModalVisible
      })
    }
  },
  saveEdit() {
    const _this = this;
    this.props.form.validateFieldsAndScroll((errors, values) => {
      if (!!errors) {
        console.log('Errors in form!!!');
        return;
      }
      
      this.setState({
        confirmSaveEditLoading: true
      })
      Ajax.post({
        url: API.CASE_DO_EDIT_SAVE,
        data: {
          _id: this.props.doCaseId,
          version: this.props.form.getFieldValue('doversion'),
          times: this.props.form.getFieldValue('dotimes'),
          user: this.props.form.getFieldValue('douser'),
          userSelectVal: this.stateValue.userSelectVal
        },
        success(res) {
          const result = res.body;

          if (result.status === 200) {
            _this.setState({
              saveEditModalVisible: false,
              confirmSaveEditLoading: false
            })
            PubSubMsg.publish('caes-do-edit-save-success', {});
          }
        }
      })
    });
  },
  handleSaveEditOk() { 
    this.saveEdit();
  },
  handleSaveEditCancel() {
    this.setState({
      saveEditModalVisible: false
    })
  },
  userSelectChange(val, label) {
    this.stateValue.userSelectVal = {
      value: val,
      label: label
    };
  },
  render() {
    const { getFieldProps } = this.props.form;

    const douserProps = getFieldProps('douser', {
      rules: [
        { required: true, message: '执行用户必填' }
      ],
    });
    const doversionProps = getFieldProps('doversion', {
      rules: [
        { required: true, message: '执行版本必填' }
      ],
    });
    const dotimesProps = getFieldProps('dotimes', {
      rules: [
        { required: true, type: 'number', message: '执行轮数必填' }
      ],
    });


    return (
      <div>
        <Modal confirmLoading={this.state.confirmSaveEditLoading} maskClosable={false} title="用例执行编辑" visible={this.state.saveEditModalVisible}
          onOk={this.handleSaveEditOk} onCancel={this.handleSaveEditCancel}>


          <Spin spinning={this.state.loading}>
            <Form horizontal form={this.props.form}>
              <FormItem
                label="执行用户：">
                <UserSelect {...douserProps} onChange={this.userSelectChange} />
              </FormItem>
            </Form>
            <Form horizontal>
              <FormItem
                label="执行版本：">
                <Input {...doversionProps} style={{ width: 160 }} />
              </FormItem>
            </Form>
            <Form horizontal>
              <FormItem
                label="执行轮数：">
                <InputNumber {...dotimesProps} min={1} max={10} />
              </FormItem>
            </Form>
            <Form horizontal>
              <FormItem
                label="用例等级：">
                <CheckboxGroup options={['高', '中', '低']} value={this.state.levelValue} />
              </FormItem>
            </Form>
          </Spin>

        </Modal>
      </div>
    );
  },
});

CaseDoEdit = createForm()(CaseDoEdit);

export default CaseDoEdit;