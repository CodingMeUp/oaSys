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
import _ from 'lodash';
import API from '../../API';
import Ajax from '../../../framework/common/ajax';

const FormItem = Form.Item;

class BugComment extends Component {
  constructor(props) {
    super(props);

  }

  componentDidMount() {

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
    const comment = window['win_editor_comment'].html();
    const _this = this;

    Ajax.post({
      url: API.BUG_UPDATE_COMMENT,
      data: {
        comment: comment,
        bugId: this.props.bugId,
        project: this.props.projectId,
        product: this.props.productId,
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

    let ui;
    if (this.loadUi) {
      ui = (<Form horizontal form={this.props.form}>
        <FormItem
          {...formItemLayout}
          label="备注"
          >
          <Editor editorId="win_editor_comment" editorName="win_editor_comment" />
        </FormItem>
      </Form>);
    }

    return (
      <div>
        <Modal title={<span><FAIcon type="fa-comment-o" /> 备注</span>}
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

BugComment = Form.create()(BugComment);

export default BugComment;