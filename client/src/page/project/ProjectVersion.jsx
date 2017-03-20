import React from 'react';
import { Timeline, Button, Select,Modal, Form, Input, DatePicker, Checkbox, Radio, Row, Col, Tooltip, Icon, Tag, Popconfirm } from 'antd';
import Page from '../../framework/page/Page';
import Ajax from '../../framework/common/ajax';
import classNames from 'classnames';
import moment from 'moment';
import API from '../API';
import Funs from '../../framework/common/functions';
import Storage from '../../framework/common/storage';
import PubSubMsg from '../../framework/common/pubsubmsg';
import _ from 'lodash';
const FormItem = Form.Item;
const createForm = Form.create;
const Option = Select.Option;
const OptGroup = Select.OptGroup;

const top_current_project = Funs.top_current_project + '_' + _USERINFO.userId;


let Version = React.createClass({
  getInitialState() {
    return {
      loading: false,
      visible: false,
      data: [] ,
      topSelBackData: {},
      optType:'',
      editId:'',
      hideStyle: {marginLeft:10,display : 'none '},
      editHideStyle: {display:'none'},
      platformSelect:[],
      platformSelectParam:'',
      envSelect:[],
      envSelectParam:'',
      envStyle :{ display:'none'},
    }
  },
  componentWillUnmount: function () {
    this.initReq.abort();
    if (this.postReq) {
      this.postReq.abort();
    }
    PubSubMsg.unsubscribe('get_current_project');
  },
  componentDidMount: function () {
    let _this = this;
    this.loadData();
    let auth = Storage.local.get(top_current_project)? Storage.local.get(top_current_project).auth : [];
    for (var i = 0; i < auth.length; i++) {
        if(auth[i].oper_href === '/client/projectVersionEdit'){
           this.setState({
             editHideStyle: {display:''}
           });
           break;
        }
    };
    PubSubMsg.subscribe('get_current_project', function (resData) {
      _this.setState({
        loading: false,
        topSelBackData: resData
      });
      _this.loadData();
    });

  },
  loadData: function () {
    let _this = this;
    _this.initReq = Ajax.get({
      url: API.PROJECT_SYSTEM_VERSION,
      data: {
        type: Storage.local.get(top_current_project).type,
        belong_id:Funs.decrypt(Storage.local.get(top_current_project).currentProject, Funs.secret),
        platform: this.state.platformSelectParam,
        env: this.state.envSelectParam,
      },
      before() {
        _this.setState({
          loading: true
        });
      },
      success(res) {
        const result = res.body;

        if (result && result.status === 200) {

          _this.setState({
            data: result.data,
            platformSelect: result.platformSelect,
            loading: false
          });
        }
      }
    })
  },
  showModal() {
    this.setState({
      visible: true,
      optType:'add',
      editId:''
    });
    this.props.form.resetFields();
  },
  handleOk() {
    let _this = this;
    this.props.form.validateFields((errors, values) => {
      if (!!errors) {
        return;
      }
      let data = {};
      if(Storage.local.get(top_current_project)){
        data = {
          date: moment(_this.props.form.getFieldValue('datetime')).format('YYYY-MM-DD HH:mm:ss'),
          remark: _this.props.form.getFieldValue('remark'),
          platform: _this.props.form.getFieldValue('platform'),
          ver: _this.props.form.getFieldValue('version'),
          env: _this.props.form.getFieldValue('env') ? _this.props.form.getFieldValue('env') : '',
          belong_id : Funs.decrypt(Storage.local.get(top_current_project).currentProject, Funs.secret),
          type: Storage.local.get(top_current_project).type,
          optType :this.state.optType,
          editId:this.state.editId
        }
      }else{
        data = {
          date: moment(_this.props.form.getFieldValue('datetime')).format('YYYY-MM-DD HH:mm:ss'),
          platform: _this.props.form.getFieldValue('platform'),
          remark: _this.props.form.getFieldValue('remark'),
          ver: _this.props.form.getFieldValue('version'),
          env: _this.props.form.getFieldValue('env') ? _this.props.form.getFieldValue('env') : '',
          type: '',
          belong_id:undefined,
          optType :this.state.optType,
          editId:this.state.editId
        }
      }
      _this.postReq = Ajax.post({
        url: API.PROJECT_SYSTEM_VERSION,
        data: data,
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
              loading: false,
              platformSelectParam:'',
              envSelectParam:''
            });

            _this.loadData();
          }
        }
      })

    });
  },
  platformSelect(e){
    const _this = this;
    Ajax.post({
      url: API.PROJECT_SYSTEM_VERSION_LOADENV,
      data: {
        type: Storage.local.get(top_current_project).type,
        belong_id:Funs.decrypt(Storage.local.get(top_current_project).currentProject, Funs.secret),
        platform: e,
      },
      before() {

      },
      success(res) {
        const result = res.body;
        if (result && result.status === 200) {

          if(e==='all'){
             _this.setState({
              platformSelectParam: '',
              envSelectParam: '',
              envSelect: result.envSelect,
              envStyle :{ width:180, marginLeft :10 ,display:''}
            },() => {
              _this.loadData();
            });
          }else{
              _this.setState({
                platformSelectParam: e,
                envSelectParam: '',
                envSelect: result.envSelect,
                envStyle :{ width:180, marginLeft :10 ,display:''}
              },() => {
                _this.loadData();
              });
          }
        }
      }
    })
  },
  envSelect(e){
    const _this = this;
    if(e === 'all'){
      //同步sst
      this.setState({
        envSelectParam: '',
      }, () => {
        _this.loadData();
      });
    }else{
       this.setState({
        envSelectParam: e,
      }, () => {
           _this.loadData();
      });
    }

  },
  loadEnvData(){

  },
  handleCancel() {
    this.setState({
      visible: false
    });
  },
  setHideToShow(){
    this.setState({
      hideStyle:{marginLeft:10,display:''},
      editHideStyle:{display:'none'}
    });
  },
  deleteConfirm(id) {
    let _this = this;
    Ajax.delete({
      url: API.PROJECT_SYSTEM_VERSION,
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
  editClick(da){
    this.setState({
      visible:true,
      optType:'edit',
      editId:da._id
    },() =>{
      this.props.form.setFieldsValue({
        datetime: new Date(moment(da.date).format('YYYY-MM-DD HH:mm:ss')),
        platform: da.platform,
        remark: da.remark,
        version: da.ver,
        env: da.env
      });
    });

  },
  render() {
    const pageHeader = {
      title: `项目【${Storage.local.get(top_current_project).currentProjectName}】版本记录`
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
    const platformProps = getFieldProps('platform', {
      rules: [
        { required: true, message: '项目(或端)内容必填' },
      ],
    });
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
    const envProps = getFieldProps('env', {
      rules: [
        { required: false, message: '环境选填' },
      ],
    });
    const disabledDate = function (current) {
      return current && current.getTime() > Date.now();
    };
    let envOptions =  <Option key={'all'} value={'all'} >{'不限'}</Option>
    if(this.state.envSelect){
        envOptions = this.state.envSelect.map(d => <Option searchValue={d} key={d} value={d}>{d}</Option>)
    }
    const platformOptions = this.state.platformSelect?this.state.platformSelect.map(d => <Option searchValue={d} key={d} value={d}>{d}</Option>):'';
    return (
      <Page header={pageHeader} loading={this.state.loading} animConfig={animConfig}>
        <div style={{ margin: 10 }}>
          <Button type="primary" style={this.state.hideStyle} onClick={this.showModal}>添加版本变更记录</Button>
          <Button type="primary" style={this.state.hideStyle} onClick={()=>{window.location.reload();}}>刷新回到查看页面</Button>
          <Button type="primary" style={this.state.editHideStyle} onClick={this.setHideToShow}>编辑版本变更记录</Button>
           <Select  allowClear    onSelect={this.platformSelect} showSearch
              style={{ width:180 ,marginLeft :10 }}
              placeholder="请选择项目(或端)"
              optionFilterProp="searchValue"
              notFoundContent="无法找到">
              <OptGroup label={'显示不限'}>
                <Option key={'all'} value={'all'} >{'不限'}</Option>
              </OptGroup>
              <OptGroup key="opt" label="项目或端">
              {platformOptions}
              </OptGroup>
            </Select>
          <Select  allowClear  onSelect={this.envSelect} showSearch
                  style={this.state.envStyle}
                  placeholder="请选择环境"
                  optionFilterProp="searchValue"
                  notFoundContent="无法找到">
                  <OptGroup label={'显示不限'}>
                    <Option key={'all'} value={'all'} >{'不限'}</Option>
                  </OptGroup>
                  <OptGroup key="opt" label="环境">
                  {envOptions}
                  </OptGroup>
        </Select>
          <Modal title="添加版本变更记录" width={800} maskClosable={false} visible={this.state.visible}
            onOk={this.handleOk}
            confirmLoading={this.state.confirmLoading}
            onCancel={this.handleCancel}>
            <Form horizontal form={this.props.form}>
             <FormItem
                {...formItemLayout}
                label="项目(或端)：">
                <Input {...platformProps}  />
              </FormItem>
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
                label="环境：">
                <Input {...envProps}  />
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="更新内容：">
                <Input  type="textarea" {...remarkProps} rows="10" />
              </FormItem>
            </Form>
          </Modal>
          <br /><br />
          <div className="projectVersionStyle">
          <Timeline>
            {this.state.data.map(da =>
              <Timeline.Item key={da._id} color="green">
                <div className="projectVersion" >
                  <p >
                    <strong>项目或端：{da.platform}</strong>
                    <br/>
                    <Tag color='blue'>{moment(da.date).format('YYYY-MM-DD HH:mm:ss') }</Tag>
                    <br/>
                    <strong>版本号：{da.ver}</strong>
                    <br/>
                    <strong>环境：{da.env}</strong>
                    <span>
                     <Button type="primary"  className='first' size="small" onClick = {this.editClick.bind(this,da)} style={this.state.hideStyle}>
                          <Icon type="edit" />
                          编辑
                        </Button>
                      <Popconfirm title="确定要删除这个吗？"  onConfirm={this.deleteConfirm.bind(this, da._id) }>
                        <Button type="primary" size="small" style={this.state.hideStyle}>
                          <Icon type="cross" />
                          删除
                        </Button>
                      </Popconfirm>
                    </span>
                  </p>
                  <div className='remarkCls' dangerouslySetInnerHTML={{ __html: da.remark.replace(/\n/g, "<br />") }} />
                </div>

              </Timeline.Item>
            ) }
          </Timeline>
          </div>
        </div>

      </Page>
    );
  }
});

Version = createForm()(Version);

export default Version;
