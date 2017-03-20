import './style.less';
import React from 'react';
import ReactDOM from 'react-dom';
import { LinkedStateMixin } from 'react-addons';
import reqwest from 'reqwest';
import _ from 'lodash';
import { Breadcrumb, Card, Transfer, Popconfirm, Row, Col, Table, Select, message, Modal, Input, InputNumber, Checkbox, Form, Button, Icon, Tooltip, Tag, Menu, Switch, Dropdown, TreeSelect } from 'antd'
import Page from '../../framework/page/Page';
import API from '../API';
import Storage from '../../framework/common/storage';
import PubSubMsg from '../../framework/common/pubsubmsg';
import Ajax from '../../framework/common/ajax';
import Function from '../../framework/common/functions';
import SearchInput from '../ctrl/SearchInput';
import UserSelect from '../case_do/UserSelect';
import AllProjectTree from './AllProjectTree';
import $ from 'jquery';
const Option = Select.Option;
const OptGroup = Select.OptGroup;
const CheckboxGroup = Checkbox.Group;
const FormItem = Form.Item;
const createForm = Form.create;
const confirm = Modal.confirm;
const InputGroup = Input.Group;

//项目匹配
const top_current_project = Function.top_current_project + '_' + _USERINFO.userId;

let ProjectTransform = React.createClass({
  stateValue: {},
  mixins: [LinkedStateMixin],
  getInitialState() {
    return {
      data: [],
      pmsProductData: [],
      pmsValue: [],
      selectPmsModName: '',
      caseMngValue: [],
      checkedKeys: [],
    }
  },
  componentDidMount() {

  },
  loadPmsProduct() {
    let _this = this;
    if (_this.state.pmsProductData.length > 0) {

    } else {
      reqwest({
        url: API.PMS_PRODUCT_LIST,
        method: 'get',
        data: null,
        type: 'json',
        success: (result) => {
          _this.setState({
            pmsProductData: result.data
          });
        }
      });
    }

  },
  transformBtnClick() {
    this.stateValue = {};
    this.stateValue.pms = { pmsValue: this.state.pmsValue, pmsName: this.state.pmsName };
    this.stateValue.caseMng = this.state.checkedKeys;
    if (this.stateValue.caseMng && this.stateValue.caseMng.length > 0 && this.stateValue.pms.pmsValue) {
      Ajax.post({
        url: API.PMS_CASEMNG_TRANSFORM,
        data: this.stateValue,
        success(res) {
          if (res.body.status == 200) {
            message.info(res.body.message);
          } else {
            message.error(res.body.message);
          }
        }
      })
    } else {
      message.error('请保证PMS产品项目或用例系统项目被勾选！');
    }
    // window.location.reload();
  },

  onPmsSelect(value, e) {
    this.setState({
      pmsValue: value,
      pmsName: e.props.title
    });
  },
  onCheck(checkedKeys, e) {
    // console.log(selectArray,e.node.props.nodeData)
    this.setState({
      checkedKeys: checkedKeys
    });
  },
  onSearch(value) {

  },
   setProductBtnClick(){
    this.stateValue = {};
    this.stateValue. pmsValue =this.state.pmsValue;
    this.stateValue.pmsName = this.state.pmsName;
    this.stateValue.userSelectData = this.state.userValue;
    if(this.stateValue.pmsValue.length != 0 && this.stateValue.userSelectData){
      Ajax.post({
        url: API.SET_PRODUCT_AND_MODULE,
        data: this.stateValue,
        success(res) {
          if (res.body.status == 200) {
            message.info(res.body.message);
          } else {
            message.error(res.body.message);
          }
        }
      })
    }else{
      message.error('请保证PMS产品以及项目负责人已选择！');
    }



  },
  onUserSelect(value, e) {
    this.setState({
      userValue: value
    });

  },
  render() {
    const pageHeader =
      <div>
        <h1 className="admin-page-header-title">项目匹配设置</h1>
        <Breadcrumb>
          <Breadcrumb.Item><Icon type="home" />首页</Breadcrumb.Item>
          <Breadcrumb.Item>项目管理</Breadcrumb.Item>
          <Breadcrumb.Item>功能权限设置</Breadcrumb.Item>
        </Breadcrumb>
      </div>;
    return (
      <Page header={pageHeader} loading={this.state.loading}>
        <div>
          <h2>
            PMS项目
                            </h2>
          <TreeSelect style={{ width: 350 }}
            showSearch={true}
            multiple={false}
            onSearch={this.onSearch}
            onClick={this.loadPmsProduct}
            dropdownMatchSelectWidth={false}
            dropdownStyle={{ minHeight: 500, width: 350, maxHeight: 800, overflow: 'auto' }}
            treeNodeFilterProp={'label'}
            value={this.state.pmsValue}
            placeholder="加载当前pms产品模块"
            treeData={this.state.pmsProductData}
            treeDefaultExpandAll
            onSelect={this.onPmsSelect}
            >
          </TreeSelect>

          <Button style={{ marginLeft: 20 }} type='primary' onClick={this.transformBtnClick}>
            确定匹配
          </Button>
          <span style={{marginLeft: 20 ,fontWeight:700}}>项目负责人</span>
          <UserSelect  data={this.state.userSelectData} style={{ width: 180, marginLeft: 20 }} onSelect={this.onUserSelect} />
          <Button style={{ marginLeft: 20 }} type='primary' onClick={this.setProductBtnClick}>保存项目及负责人到用例平台</Button>

          {
            // <Card title={this.state.selectPmsModName} extra={<a href="#">More</a>} style={{ width: 300 }}>
            //     <p>{this.state.selectPmsModName}</p>
            // </Card>
            // <input type="text" valueLink={this.linkState('pmsValue')} />
            //<input type="checkbox" checkedLink={this.linkState('pmsValue')} />
          }
        </div>

        <div style={{ marginTop: 20 }}>
          <h2>
            用例项目列表(tips:下拉项目都在列表中之后进行复选勾选)
                            </h2>
          <div className="case-side-tree" >
            <AllProjectTree onCheck={this.onCheck} />
          </div>
        </div>

      </Page>
    );

  }

});
ProjectTransform = createForm()(ProjectTransform);
export default ProjectTransform;