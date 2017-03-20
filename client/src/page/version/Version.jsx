import React from 'react';
import { Timeline, Button, Modal, Form, Input, DatePicker, Checkbox, Radio, Row, Col, Tooltip, Icon, Tag, Popconfirm } from 'antd';
import Page from '../../framework/page/Page';
import Ajax from '../../framework/common/ajax';
import classNames from 'classnames';
import moment from 'moment';
import API from '../API';
const FormItem = Form.Item;
const createForm = Form.create;


let Version = React.createClass({
  getInitialState() {
    return {
      loading: false,
      visible: false,
      data: []
    }
  },
  componentWillUnmount: function () {
    this.initReq.abort();
    if (this.postReq) {
      this.postReq.abort();
    }
  },
  componentDidMount: function () {
    this.loadData();
  },
  loadData: function () {
    let _this = this;
    _this.initReq = Ajax.get({
      url: API.SYSTEM_VERSION,
      before() {
        _this.setState({
          loading: true
        });
      },
      success(res) {
        const result = res.body;

        if (result.status === 200) {
          _this.setState({
            data: result.data,
            loading: false
          });
        }
      }
    })
  },
  showModal() {
    this.setState({
      visible: true
    });
    this.props.form.resetFields();
  },
  handleOk() {
    let _this = this;
    this.props.form.validateFields((errors, values) => {
      if (!!errors) {
        return;
      }
      _this.postReq = Ajax.post({
        url: API.SYSTEM_VERSION,
        data: {
          date: moment(_this.props.form.getFieldValue('datetime')).format('YYYY-MM-DD HH:mm:ss'),
          remark: _this.props.form.getFieldValue('remark'),
          ver: _this.props.form.getFieldValue('version')
        },
        before() {
          _this.setState({
            loading: true
          });
        },
        success(res) {
          const result = res.body;

          if (result.status === 200) {
            _this.setState({
              visible: false,
              loading: false
            });

            _this.loadData();
          }
        }
      })

    });
  },
  handleCancel() {
    this.setState({
      visible: false
    });
  },
  deleteConfirm(id) {
    let _this = this;
    Ajax.delete({
      url: API.SYSTEM_VERSION,
      data: {
        id: id
      },
      before() {
        _this.setState({
          loading: true
        });
      },
      success(res) {
        const result = res.body;

        if (result.status === 200) {
          _this.setState({
            loading: false
          });

          _this.loadData();
        }
      }
    })
  },
  render() {
    const pageHeader = {
      title: '版本变更记录'
    };
    let animConfig = [
      { opacity: [1, 0], translateX: [0, 50] },
      { opacity: [1, 0], translateX: [0, -50] }
    ];
    const { getFieldProps } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 16 },
    };
    const datetimeProps = getFieldProps('datetime', {
      rules: [
        { required: true, type: 'date', message: '更新时间必填' },
      ],
    });
    const remarkProps = getFieldProps('remark', {
      rules: [
        { required: true, message: '更新内容必填' },
      ],
    });
    const versionProps = getFieldProps('version', {
      rules: [
        { required: true, message: '版本号必填' },
      ],
    });
    const disabledDate = function (current) {
      return current && current.getTime() > Date.now();
    };
    return (
      <Page header={pageHeader} loading={this.state.loading} animConfig={animConfig}>
        <div style={{ margin: 10 }}>
          <Button type="primary" onClick={this.showModal}>添加版本变更记录</Button>
          <Modal title="添加版本变更记录" width={800} maskClosable={false} visible={this.state.visible}
            onOk={this.handleOk}
            confirmLoading={this.state.confirmLoading}
            onCancel={this.handleCancel}>
            <Form horizontal form={this.props.form}>
              <FormItem
                {...formItemLayout}
                label="版本号：">
                <Input {...versionProps}  />
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="更新时间：">
                <DatePicker disabledDate={disabledDate} {...datetimeProps} showTime format="yyyy-MM-dd HH:mm:ss" placeholder="请选择时间" style={{ width: 160 }} />
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="更新内容：">
                <Input  type="textarea" {...remarkProps} rows="10" />
              </FormItem>
            </Form>
          </Modal>
          <br /><br />
          <Timeline>
            {this.state.data.map(da =>
              <Timeline.Item key={da._id} color="green">
                <div style={{ fontSize: 14 }}>
                  <p>
                    <strong>版本号：{da.ver}</strong>
                    <span style={{ float: 'right' }}>
                      <Popconfirm title="确定要删除这个吗？" onConfirm={this.deleteConfirm.bind(this, da._id) }>
                        <Button type="primary" size="small">
                          <Icon type="cross" />
                          删除
                        </Button>
                      </Popconfirm>
                    </span>
                  </p>
                  <Tag>{moment(da.date).format('YYYY-MM-DD HH:mm:ss') }</Tag>
                  <div dangerouslySetInnerHTML={{ __html: da.remark.replace(/\n/g, "<br />") }} />
                </div>

              </Timeline.Item>
            ) }
          </Timeline>
        </div>

      </Page>
    );
  }
});

Version = createForm()(Version);

export default Version;
