import './style.case.spreadsheet.less';
import React from 'react';
import {Tooltip, Modal, Button, Menu, Dropdown, Upload, Icon, message, Tabs, Table, Tag, Radio } from 'antd'
import * as _ from 'lodash';
import PubSubMsg from '../../framework/common/pubsubmsg';
import Ajax from '../../framework/common/ajax';
import API from '../API';
import Funs from '../../framework/common/functions';
import Storage from '../../framework/common/storage';
const top_current_project = Funs.top_current_project +'_'+_USERINFO.userId;


const UploadXmind = React.createClass({
  getInitialState() {
    return {
      visible: this.props.xmindModalVisible,
      confirmLoading: false
    }
  },
  componentDidMount() {

  },
  componentWillReceiveProps: function (nextProps) {
    this.setState({
      visible: nextProps.xmindModalVisible,
      projectId: nextProps.projectId
    })
  },
  handleOk() {
    this.setState({
      visible: false
    })
    PubSubMsg.publish('unvisible-case-xmind-upload', {});
  },
  handleCancel() {
    this.setState({
      visible: false
    })
    PubSubMsg.publish('unvisible-case-xmind-upload', {});
  },
  handleChange(info) {
    if (info.file.status === 'error') { 
       message.error('导图用例模板，不符合模板规则，请确认');
       return;
    }
    
    if (info.file.status === 'done') {      
      this.setState({
        visible: false
      })
      
      message.info("已成功导入模板数据");
      PubSubMsg.publish('refresh-tree-data', {});
      PubSubMsg.publish('unvisible-case-xmind-upload', {});
    }
  },
  render() {
    const props = {
      name: 'file',
      data: {
        type: this.state.uploadType,
        projectId: this.props.projectId,
        productId: Storage.local.get(top_current_project) ? Funs.decrypt(Storage.local.get(top_current_project).currentProject, Funs.secret) : null,
        navigateType:Storage.local.get(top_current_project) ? Storage.local.get(top_current_project).type : null,

      },
      showUploadList: false,
      onChange: this.handleChange,
      beforeUpload(file) {
        const isXmind = file.name.indexOf('.xmind') == file.name.length - 6;
        if (!isXmind) {
          message.error('只能上传 Xmind导图 文件哦！');
        }
        return isXmind;
      },
      action: API.UPLOAD_XMIND
    };

    return (
      <div>
        <Modal confirmLoading={this.state.confirmLoading} maskClosable={false} title="导图用例导入" visible={this.state.visible}
          footer={[
            <Button key="back" type="ghost" size="large" onClick={this.handleCancel}>返 回</Button>            
          ]}
          onOk={this.handleOk} onCancel={this.handleCancel}>
        <Upload {...props}>
          <Button type="ghost">
            <Icon type="upload" /> 点击上传用例导图文件
          </Button> 
        </Upload>
         &nbsp; &nbsp; &nbsp;
        <Tooltip placement="bottomLeft" title="Xmind模板下载">
          <a href="/assets/book/Xmind模板.xmind" download>
            <Icon type="question-circle-o"/>Xmind模板下载
          </a>
        </Tooltip>
        </Modal>
      </div>
    );
  }
});

export default UploadXmind;
