import React from 'react';
import reqwest from 'reqwest';
import { Tabs, Icon, Form, Input, Select, Radio, Button, Modal, Tag } from 'antd';
import Page from '../../framework/page/Page';
const TabPane = Tabs.TabPane;
const createForm = Form.create;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const confirm = Modal.confirm;

let Deploy = React.createClass({
  getInitialState() {
    return {
      testRedioValue: 1,
      version: [],
      postLoading: false,
      backInfoVis: 'none',
      btnTestEnable: false,
      btnTestText: '开始部署',
      activeKey: '2',
      complete: 'none'
    };
  },
  componentDidMount() {
    if (_NODE_ENV === 'test' || _NODE_ENV === 'production') {
      this.setState({
        btnTestEnable: false
      });
    }
    if (_NODE_ENV === 'test') {
      this.setState({
        activeKey: "1"
      });
    }
    if (_NODE_ENV === 'production') {
      this.setState({
        activeKey: "2"
      });
    }
  },
  onTestRedioChange(e) {
    if (e.target.value === 2 && this.state.version.length === 0) {
      reqwest({
        url: '/client/deploy',
        method: 'get',
        type: 'json',
        success: (result) => {
          if (result.status === 200) {
            let version = this.state.version;
            result.data.log.logentry.forEach(item => {
              version.push(<Option key={item['$'].revision} value={item['$'].revision}>[{item['$'].revision}]- {item.msg}</Option>);
            })

            this.setState({
              version: version
            });
          }
        }
      });
    }
    this.setState({
      testRedioValue: e.target.value
    });
  },
  postTestDeploy() {
    let _this = this;
    let content = '部署版本：' + (this.state.testRedioValue === 1 ? '最新版本' : '版本号：' + this.props.form.getFieldValue('version'));
    content += '   环境：' + (this.state.activeKey == 2 ? '测试环境' : '正式环境');
    confirm({
      title: '确定要执行部署任务吗？',
      content: content,
      onOk() {
        let version = _this.state.testRedioValue === 1 ? 0 : _this.props.form.getFieldValue('version');
        let reason = _this.props.form.getFieldValue('reason') ? _this.props.form.getFieldValue('reason') : '';
        _this.setState({
          postLoading: true,
          btnTestText: '正在执行部署,稍等...'
        });
        _this.props.form.setFieldsValue({
          backInfo: ''
        });

        reqwest({
          url: '/client/deploy',
          method: 'post',
          data: {
            version: version,
            reason: reason,
            type: _this.state.activeKey == 2 ? 'test' : 'production'
          },
          type: 'json',
          success: (result) => {
            _this.props.form.setFieldsValue({
              backInfo: result.data
            });

            _this.setState({
              postLoading: false,
              backInfoVis: '',
              btnTestText: '开始部署',
              complete: ''
            });
            setTimeout(() => {
              _this.setState({
                complete: 'none'
              });
            }, 3000);
          }
        });
      },
      onCancel() { }
    });
  },
  onTabChange(activeKey) {
    this.setState({ activeKey });
    if (_NODE_ENV === 'test' && activeKey == 2) {
      this.setState({
        btnTestEnable: false
      });
    }
    if (_NODE_ENV === 'production' && activeKey == 1) {
      this.setState({
        btnTestEnable: false
      });
    }
  },
  render() {
    const { getFieldProps } = this.props.form;
    const pageHeader = {
      title: '项目部署',
      breadcrumbItems: [

      ]
    };
    let animConfig = [
      { opacity: [1, 0], translateX: [0, 50] },
      { opacity: [1, 0], translateX: [0, -50] }
    ];
    const tabContent = [
      <span><Icon type="apple" />正式环境</span>,
      <span><Icon type="android" />测试环境</span>
    ];
    const radioStyle = {
      display: 'block',
      height: '30px',
      lineHeight: '30px',
    };
    const formItemLayout = {
      labelCol: { span: 2 },
      wrapperCol: { span: 22 }
    };
    const backInfoProps = getFieldProps('backInfo', {});
    const versionProps = getFieldProps('version', {});
    const reasonProps = getFieldProps('reason', {});
    const versionSelectPlaceholder = this.state.version.length > 0 ? "请选择要部署的版本..." : "正在加载SNV版本信息...";
    const backInfoVis = this.state.backInfoVis;

    const form = (<Form horizontal form={this.props.form}>
      <FormItem
        {...formItemLayout}
        label="选择版本：">
        <RadioGroup onChange={this.onTestRedioChange} value={this.state.testRedioValue}>
          <Radio style={radioStyle} key="a" value={1}>部署最新版本</Radio>
          <Radio style={radioStyle} key="b" value={2}>
            部署指定的版本...
            {this.state.testRedioValue === 2 ?
              <Select {...versionProps}  style={{ width: 500 }} placeholder={versionSelectPlaceholder}>
                {this.state.version}
              </Select>
              : null}
          </Radio>
        </RadioGroup>
      </FormItem>
      <FormItem
        {...formItemLayout}
        label="部署原因说明：">
        <Input {...reasonProps} type="textarea" placeholder="部署原因说明" rows="5" />
      </FormItem>
      <FormItem
        {...formItemLayout}
        label=" ">
        <Button size="large" disabled={this.state.btnTestEnable} type="primary" loading={this.state.postLoading} onClick={this.postTestDeploy}>
          <Icon type="check" />
          {this.state.btnTestText}
        </Button>

        <span style={{ paddingLeft: 20, display: this.state.complete }}><Tag color="green">已提交部署，任务将在后台运行，一般需要一到两分钟时间，请稍候尝试</Tag></span>
      </FormItem>
      <div style={{ display: backInfoVis }}>
        <FormItem
          {...formItemLayout}
          label="返回信息：">
          <Input {...backInfoProps} disabled={true} type="textarea" placeholder="" rows="20" />
        </FormItem>
      </div>
    </Form>);
    return (
      <Page header={pageHeader} animConfig={animConfig}>
        <Tabs onChange={this.onTabChange} activeKey={this.state.activeKey}>
          <TabPane tab={tabContent[0]} key="1">
            {form}
          </TabPane>
          <TabPane tab={tabContent[1]} key="2">
            {form}
          </TabPane>
        </Tabs>
      </Page>
    );
  }
});

Deploy = createForm()(Deploy);

export default Deploy;
