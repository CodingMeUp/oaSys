import '../style.bug.less';
import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { browserHistory, Router, Route, Link } from 'react-router';
import { connect } from 'react-redux';
import moment from 'moment';
import FAIcon from '../../../framework/faicon/FAIcon';
import { Breadcrumb, Button, Menu, Icon, Tree, Tooltip, Spin, message, Modal, Select, Dropdown, Table, Tabs, Form, Input, Upload, DatePicker } from 'antd';
import * as BugAction from '../../../actions/bugs';
import Editor from '../../utils/Editorer';
import _ from 'lodash';

const FormItem = Form.Item;

class BugConfirm extends Component {
  constructor(props) {
    super(props);

  }

  componentDidMount() {

  }

  componentWillUnmount() {

  }

  componentWillUpdate(nextProps) {
    const tf = _.isEqual(this.props.visible, nextProps.visible);

    if (!tf) {
      this.loadUi = true;
    }
  }

  onOk() {
    var comment = window['editor_confirm_comment'].html();

    this.props.onOk(comment);
  }

  render() {
    const formItemLayout = {
      labelCol: { span: 2 },
      wrapperCol: { span: 22 }
    };

    let ui;
    if (this.loadUi) {
      ui = (<Form horizontal form={this.props.form}>
        <FormItem
          {...formItemLayout}
          label="指派给"
          >
          <Select style={{width: 300}}>

          </Select>
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="Bug责任人"
          >
          <Select style={{width: 300}}>
            
          </Select>
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="优先级"
          >
          <Select style={{width: 300}}>
            
          </Select>
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="预计解决"
          >
          <DatePicker />
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="抄送给"
          >
          <Select>
            
          </Select>
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="备注"
          >
          <Editor editorId="editor_confirm_comment" editorName="editor_confirm_comment" />
        </FormItem>
      </Form>);
    }

    return (
      <div>
        <Modal title={<span>确认</span>}
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

BugConfirm = Form.create()(BugConfirm);

export default BugConfirm;