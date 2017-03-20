import './style.less';
import React from 'react';
import ReactDOM from 'react-dom';
import reqwest from 'reqwest';
import _ from 'lodash';
import { Breadcrumb, TreeSelect, Transfer, Popconfirm, Table, Select, message, Modal, Input, InputNumber, Checkbox, Form, Button, Icon, Tooltip, Tag, Menu, Dropdown } from 'antd'
import Page from '../../framework/page/Page';
import API from '../API';
import Storage from '../../framework/common/storage';
import PubSubMsg from '../../framework/common/pubsubmsg';
import Ajax from '../../framework/common/ajax';
import Function from '../../framework/common/functions';
import SearchInput from '../ctrl/SearchInput';
import CryptoJS from 'crypto-js';
const Option = Select.Option;
const OptGroup = Select.OptGroup;
const CheckboxGroup = Checkbox.Group;
const FormItem = Form.Item;
const createForm = Form.create;
const confirm = Modal.confirm;

let currentRow;

const top_current_project = Function.top_current_project + '_' + _USERINFO.userId;


let ProjectAuth = React.createClass({
  stateValue: {},
  getInitialState() {
    return {
      data: [],
      value: '',
      titles: [],
      tableLoading: true,
      loading: true,
      keyword: '',
      modalVisible: false,
      modalAddVisible: false,
      confirmLoading: false,
      modalTitle: '设置项目成员角色',
      modalAddTitle: '添加项目成员',
      allRoles: [],
      pagination: {},
      topSelBackData: {},
      mockData: [],
      targetKeys: [],
      treeSelectStyle: {},
      ztModuleTreeData: [],
      ztModudleValue: '',
    }
  },
  componentWillUnmount() {
    PubSubMsg.unsubscribe('get_current_project');
  },
  componentDidMount() {
    let _this = this
    PubSubMsg.subscribe('get_current_project', function (resData) {
      _this.setState({
        loading: false,
        topSelBackData: resData
      });
      _this.fetch();
    });
    this.setState({ loading: false });
    this.fetch();
  },
  fetch(params = {}) {
    // == function (opt){   opt = opt || {}  }
    let _this = this;
    let data = {};
    let treeSelectStyle = { 'width': 200, 'marginLeft': 20, 'display': 'none' };
    if (params && params.moduleId && params.type == 'module' && this.state.ztModudleValue == params.moduleId) {
      data = { 'moduleId': params.moduleId, 'keyword': params ? params.keyword : '', 'type': 'module' };
      treeSelectStyle.display = '';
    } else if (Storage.local.get(top_current_project) && Storage.local.get(top_current_project).type == 'project') {
      data = {
        'projectId': Storage.local.get(top_current_project) ?
          Function.decrypt(Storage.local.get(top_current_project).currentProject, Function.secret) : null,
        'keyword': params ? params.keyword : '', 'type': 'project'
      };
    } else if (Storage.local.get(top_current_project) && Storage.local.get(top_current_project).type == 'product') {
      data = {
        'productId': Storage.local.get(top_current_project) ?
          Function.decrypt(Storage.local.get(top_current_project).currentProject, Function.secret) : null,
        'keyword': params ? params.keyword : '', 'type': 'product'
      };
      treeSelectStyle.display = '';
    } else {
      console.log('fetch error ')
    }
    this.setState({
      tableLoading: true,
      treeSelectStyle: treeSelectStyle
    });
    reqwest({
      url: API.PROJECT_AUTH,
      method: 'get',
      data: data,
      type: 'json',
      success: (result) => {
        // const pagination = this.state.pagination;
        // pagination.total = result.total;
        // const defaultExpandedRowKeys = [];
        // result.rows.forEach(item => {
        //   defaultExpandedRowKeys.push(item._id);
        // });

        _this.setState({
          tableLoading: false,
          data: result.rows,
          allRoles: result.allRoles
          // defaultExpandedRowKeys: defaultExpandedRowKeys,
          // pagination
        });
        if (result.message == 'none') {
          message.error(`无该搜索人员【${params.keyword}】请检查输入是否错误或该成员是否登录过！`);
        }
      }
    });
  },
  //点击产品之后的模块获取加载
  loadZtModule() {
    let _this = this;
    let data = {};
    data.product_id = Storage.local.get(top_current_project) ? Function.decrypt(Storage.local.get(top_current_project).currentProject, Function.secret) : null;
    data.type = Storage.local.get(top_current_project) ? Storage.local.get(top_current_project).type : 'module';
    if (_this.state.ztModuleTreeData && _this.state.ztModuleTreeData.length > 0) {

    } else {
      Ajax.get({
        url: API.ZT_MODULE_BY_ZT_PRODUCT,
        data: data,
        success(result) {
          _this.setState({
            ztModuleTreeData: result.body.data,
          });
        }
      })
    }
  },
  onZtModudleSelect(v, e) {
    let _this = this;
    //setState同步化回调做事情
    this.setState({
      ztModudleValue: v
    }, () => {
      _this.fetch({ moduleId: v, type: 'module' });
    });
  },
  handleTableChange(pagination, filters, sorter) {
    const pager = this.state.pagination;
    pager.current = pagination.current;
    this.setState({
      pagination: pager,
    });
    if (!this.state.keyword) {

      this.fetch({
        pageSize: pagination.pageSize,
        currentPage: pagination.current,
        sortField: sorter.field,
        sortOrder: sorter.order
      });
    }

  },

  //// 编辑模块
  createEditModal(row) {
    let allRoles = this.state.allRoles;
    let _this = this;
    _this.props.form.setFieldsValue({
      userid: row.user_id,
      usersName: row.nick_name,
      operName: row.opers,
      allRoles: allRoles
    });
    _this.setState({
      modalVisible: true,
      value: row.role_id
    });

  },
  ////新增模块
  createAddModal(row) {
    let _this = this;
    this.getMock();
    _this.props.form.setFieldsValue({
      allRoles: []
    });
    _this.setState({
      modalAddVisible: true
    });

  },
  createDeleteModal(row) {
    const _this = this;
    let content, title;
    title = "删除项目成员"
    content = <div>您确定要删除【{Storage.local.get(top_current_project).currentProjectName}】下角色为【{row.role_name}】的用户【{row.nick_name},{row.user_id}】吗？</div>;
    Modal.confirm({
      title: title,
      content: content,
      okText: '取消',
      cancelText: '确定',
      onOk() {
        message.error('取消删除');
      },
      onCancel() {
        reqwest({
          url: API.PROJECT_AUTH_DELETE,
          method: 'delete',
          contentType: 'application/json',
          data: JSON.stringify({
            user_id: row.user_id,
            role_id: row.role_id,
            pro_id: Storage.local.get(top_current_project) ?
              Function.decrypt(Storage.local.get(top_current_project).currentProject, Function.secret) : null,
            type: row.type,
            module_id: _this.state.ztModudleValue
          }),
          type: 'json',
          success: (result) => {
            if (result.flag) {
              message.success('成功删除');
            }
            _this.fetch({ keyword: _this.state.keyword, pageSize: 500, type: row.type, moduleId: _this.state.ztModudleValue });
          }
        });

      },
    });
  },
  rowKeyMake(e) {
    return e.user_id;
  },
  //删除功能
  antdConfirm(row) {
    this.deleteAction(row);
    message.success('成功删除');
  },

  antdCancel() {
    message.error('取消删除');
  },
  showSuccessMessage() {
    message.success('成功完成');
  },
  showFailMessage() {
    message.error('事件失败');
  },
  onSearch() {

  },
  handleAddOk() {
    let _this = this;
    _this.stateValue = {};
    _this.stateValue.pro_id = Function.decrypt(Storage.local.get(top_current_project).currentProject, Function.secret);
    _this.stateValue.type = Storage.local.get(top_current_project).type;
    if (this.state.ztModudleValue && this.state.treeSelectStyle.display != 'none') {
      _this.stateValue.type = 'module';
      _this.stateValue.module_id = this.state.ztModudleValue;
    }
    let tempRoleID = _this.props.form.getFieldValue('allRoles');
    for (var i = 0; i < _this.state.allRoles.length; i++) {
      if (_this.state.allRoles[i].role_id == tempRoleID) {
        _this.stateValue.nowRoleId = tempRoleID[0];
        _this.stateValue.nowRoleName = _this.state.allRoles[i].role_name;
      }
    }
    _this.stateValue.users = this.state.targetKeys;
    if (_.has(_this.stateValue, 'nowRoleId') && _this.stateValue.users.length > 0) {
      reqwest({
        url: API.PROJECT_AUTH_ADD,
        method: 'post',
        contentType: 'application/json',
        data: JSON.stringify(_this.stateValue),
        type: 'json',
        success: (result) => {
          _this.fetch({ keyword: this.state.keyword, pageSize: 500, moduleId: _this.stateValue.module_id, type: _this.stateValue.type });
          _this.setState({
            modalAddVisible: false,
            tableLoading: false
          });
          result.flag ? _this.showSuccessMessage() : _this.showFailMessage();
        }
      });
    } else {
      message.error('请选择要新增的项目角色和该角色下的人员！', 3);
      return;
    }
  },
  //Modal 保存
  handleOk() {
    let _this = this;
    _this.stateValue = {};
    _this.stateValue.user_id = _this.props.form.getFieldValue('userid');
    _this.stateValue.pro_id = Function.decrypt(Storage.local.get(top_current_project).currentProject, Function.secret);
    _this.stateValue.type = Storage.local.get(top_current_project).type;
    if (this.state.ztModudleValue && this.state.treeSelectStyle.display != 'none') {
      _this.stateValue.type = 'module';
      _this.stateValue.module_id = this.state.ztModudleValue;
    }
    let tempRoleID = _this.props.form.getFieldValue('allRoles');
    for (var i = 0; i < _this.state.allRoles.length; i++) {
      if (_this.state.allRoles[i].role_id == tempRoleID) {
        _this.stateValue.nowRoleId = tempRoleID[0];
        _this.stateValue.nowRoleName = _this.state.allRoles[i].role_name;
      }
    }
    if (_this.stateValue.nowRoleId) {
      reqwest({
        url: API.PRO_USER_ROLE_MODIFY,
        method: 'post',
        contentType: 'application/json',
        data: JSON.stringify(_this.stateValue),
        type: 'json',
        success: (result) => {
          _this.fetch({ keyword: this.state.keyword, pageSize: 500, moduleId: _this.stateValue.module_id, type: _this.stateValue.type });
          _this.setState({
            modalVisible: false,
            tableLoading: false
          });
          result.flag ? _this.showSuccessMessage() : _this.showFailMessage();
        }
      });
    } else {
      _this.setState({
        modalVisible: false
      });
    }

  },
  handleSelect(value, label) {
    let _this = this;
    let array = [];
    array.push(value);
    _this.props.form.setFieldsValue({
      allRoles: array
    });
    this.setState({
      value: value
    });
  },
  handleAddSelect(value) {
    let allRoles = this.state.allRoles;
    let _this = this;
    let rightText = '角色组';
    for (let i = 0; i < allRoles.length; i++) {
      if (allRoles[i].role_id == value) {
        rightText += '【' + allRoles[i].role_name + '】';
      }
    }
    let tit = [];
    tit.push('用户组');
    tit.push(rightText);
    let array = [];
    array.push(value);
    _this.props.form.setFieldsValue({
      allRoles: array
    });
    this.setState({
      titles: tit
    });
  },
  // Modal 取消
  handleCancel(e) {
    let _this = this;
    _this.setState({
      modalVisible: false
    });
  },
  handleAddCancel(e) {
    let _this = this;
    _this.setState({
      modalAddVisible: false
    });
  },
  //搜索
  keywordSearch(w) {
    let _this = this;
    this.state.pagination.current = 1;
    _this.setState({
      keyword: w
    });
    _this.fetch({ keyword: w });

  },
  operNameOpt(o, row, index) {
    // var str = '';
    // if(o){
    //  for (var i = 0; i < o.length; i++) {
    //     if (i == o.length - 1) {
    //       str += str + '【' + o[i] + '】';
    //     } else {
    //       str += '【' + o[i] + '】';
    //     }
    //  }
    // }
    // if(str.length>160){
    //     var showStr = str.substring(0,200) + '...';
    //     return (<Tooltip placement="bottom" title={(<div>{str}</div>)}>
    //             <span>{showStr}</span>
    //           </Tooltip>);
    // }else{
    //     return str;
    // }
    return row.role_remark;
  },
  //添加操作按钮
  projectOptFun(o, row, index) {
    return (
      <div>
        <a type="primary" onClick={this.createEditModal.bind(this, row)}>
          <Icon type="setting" />
          更改该成员角色
        </a>
        <a type="primary" style={{ 'marginTop': 10, 'display': 'inline-block' }} onClick={this.createDeleteModal.bind(this, row)}>
          <Icon type="delete" />
          删除该项目成员
        </a>
      </div>
    );
  },
  getMock() {
    let _this = this;
    let targetKeys = [];
    let mockData = [];
    let selfPart = [];
    let otherPart = [];
    Ajax.get({
      url: API.USER_ALL_LIST,
      success(res) {

        let set = new Set();
        if (_this.state.data.length > 0) {
          _this.state.data.map(x => set.add(x.user_id));
        }
        const userData = res.body.data;
        for (let i = 0; i < userData.length; i++) {
          let obj = userData[i];
          const data = {
            key: obj.user_id,
            user_id: `${obj.user_id}`,
            description: `${obj.nick_name}(${obj.nick_name_short})`,
            chosen: Math.random() * 2 > 1,
            disabled: set.has(obj.user_id)
          };
          if (obj.personInfo) {
            if (obj.personInfo.sdepcode.substring(0, 9) == _USERINFO.sdepcode) {
              selfPart.push(data);
            } else {
              otherPart.push(data);
            }
          } else {
            otherPart.push(data);
          }
        }
        mockData = selfPart.concat(otherPart);
        _this.setState({ mockData, targetKeys });
      }
    })

  },
  handleChange(targetKeys, direction, moveKeys) {
    let errorStr = '';
    let flag = false;
    let tableData = this.state.data;
    for (let i = 0; i < tableData.length; i++) {
      for (let j = 0; j < targetKeys.length; j++) {
        if (targetKeys[j] == tableData[i].user_id) {
          errorStr += `${tableData[i].nick_name}【${targetKeys[j]}】【${tableData[i].role_name}】`;
          errorStr += '|';
          flag = true;
          _.pull(targetKeys, targetKeys[j]);
        }
      }
    }
    if (flag) {
      errorStr = errorStr.substring(0, errorStr.length - 1);
      errorStr += '已有角色分配';
      message.error(errorStr, 5);
    }
    this.setState({ targetKeys: targetKeys });
  },
  renderMain(item) {
    return (`${item.user_id}-${item.description}`);
  },
  renderFooter() {
    return (
      <Button type="ghost" size="small" style={{ float: 'right', margin: 5 }} onClick={this.getMock}></Button>
    );
  },
  tableFooter(e) {
    let brwNum = 0;
    for (var i = 0; i < e.length; i++) {
      e[i].role_name === '游客' && e[i].role_id == 1 ? brwNum++ : '';
    };
    return `共【${e.length}】人,其中游客【${brwNum}】人`;
  },
  render() {
    const pageHeader =
      <div>
        <h1 className="admin-page-header-title">项目成员设置
        </h1>
        <Breadcrumb>
          <Breadcrumb.Item>
            <Icon type="home" />
            首页
          </Breadcrumb.Item>
          <Breadcrumb.Item>项目管理</Breadcrumb.Item>
          <Breadcrumb.Item>项目成员设置</Breadcrumb.Item>
        </Breadcrumb>
      </div>;
    const columns = [{
      title: '成员工号',
      dataIndex: 'user_id',
      width: 100
    }, {
      title: '姓名',
      dataIndex: 'nick_name',
      width: 90
    },
    {
      title: '项目角色',
      dataIndex: 'role_name',
      width: 100
    }, {
      title: '所在部门组别',
      dataIndex: 'user.node_name',
      width: 220,
      className: "nodeNameClz"
    }
      // , {
      //   title: '岗位',
      //   dataIndex: 'user.grade_name',
      //   width: 160,
      //   className: "nodeNameClz"
      // }
      ,
    {
      title: '成员角色拥有的权限描述',
      dataIndex: 'opers',
      width: 550,
      render: this.operNameOpt
    }, {
      title: '操作',
      dataIndex: 'opt',
      width: 200,
      className: 'optClz',
      render: this.projectOptFun
    }];

    const { getFieldProps } = this.props.form;



    const useridProps = getFieldProps('userid', {
      rules: [
        { required: false, message: '', type: "string" }
      ],
    });
    const usersNameProps = getFieldProps('usersName', {
      rules: [
        { required: false, message: '', type: "string" }
      ],
    });
    const operNameProps = getFieldProps('operName', {
      rules: [
        { required: false, message: '', type: "array" }
      ],
    });
    const allRolesProps = getFieldProps('allRoles', {
      rules: [
        { required: false, message: '', type: "array" }
      ],
    });

    const options = this.state.allRoles.map(d => {
      if (d.role_name == '超级管理员') {
        return (
          <Option key={d.role_id}
            value={d.role_id} disabled>
          </Option>
        )
      }
      return <Option key={d.role_id} value={d.role_id}>{d.role_name}---{d.role_remark} </Option>
    }
      // <Option key={d.role_id}
      //   value={d.role_id} disabled>{d.role_name}---{d.role_remark}
      // </Option>
    );

    return (
      <Page header={pageHeader} loading={this.state.loading}>
        <div className="project-bar" style={{ 'display': 'flex' }}>
          <SearchInput style={{ width: 210 }} onSearch={this.keywordSearch} placeholder="输入工号或姓名搜索" />
          {/*<TreeSelect  style={this.state.treeSelectStyle}
                            showSearch={true}
                            multiple={false}
                            onSearch={this.onSearch}
                            onClick={this.loadZtModule}
                            dropdownMatchSelectWidth={false}
                            dropdownStyle={{ minHeight: 260, width: 320, maxHeight: 500, overflow: 'auto' }}
                            treeNodeFilterProp={'label'}
                            value={this.state.ztModudleValue}
                            placeholder="加载当前产品下的模块"
                            treeData={this.state.ztModuleTreeData}
                            treeDefaultExpandAll
                            onSelect={this.onZtModudleSelect}
                            >
          </TreeSelect>*/}
          <span style={{ 'marginLeft': 30 }} ><Button type="primary" onClick={this.createAddModal}><Icon type="plus" /> {'新增项目成员'}</Button></span>
        </div>
        <div>
          <Table bordered columns={columns}
            rowKey={this.rowKeyMake}
            dataSource={this.state.data}
            defaultExpandedRowKeys={this.state.defaultExpandedRowKeys}
            pagination={false}
            loading={this.state.tableLoading}
            onChange={this.handleTableChange}
            footer={this.tableFooter}
            />
        </div>

        <Modal maskClosable={false} title={this.state.modalTitle} width={610} visible={this.state.modalVisible}
          onOk={this.handleOk} onCancel={this.handleCancel}>
          <div className="ProjectAuthForm">
            <Form horizontal form={this.props.form}>
              <FormItem label="工号：">
                <Input  {...useridProps} style={{ width: 580, color: 'black' }} disabled />
              </FormItem>
            </Form>

            <Form horizontal>
              <FormItem label="姓名：">
                <Input  {...usersNameProps} style={{ width: 580, color: 'black' }} disabled />
              </FormItem>
            </Form>

            <Form horizontal>
              <FormItem label="当前拥有的操作权限：">
                <Input  {...operNameProps} style={{ width: 580, color: 'black' }} disabled />
              </FormItem>
            </Form>
            <Form horizontal>
              <FormItem label="所属角色权限组: （可修改）">
                <Select showSearch allowClear
                  style={{ width: 580 }}
                  placeholder="请选择角色组"
                  optionFilterProp="children"
                  notFoundContent="无法找到"
                  showSearch={true}
                  onSearch={this.onSearch}
                  value={this.state.value}
                  searchPlaceholder="输入角色名"
                  onSelect={this.handleSelect}
                  >
                  <OptGroup label="分配角色">
                    {options}
                  </OptGroup>
                </Select>
              </FormItem>
            </Form>
          </div>
        </Modal>
        <Modal maskClosable={false} title={this.state.modalAddTitle} width={790} visible={this.state.modalAddVisible}
          onOk={this.handleAddOk} onCancel={this.handleAddCancel}>
          <div className="ProjectAuthForm">
            <Form horizontal form={this.props.form}>
              <FormItem label="勾选要分配的角色">
                <Select showSearch allowClear
                  style={{ width: 730 }}
                  placeholder="请选择角色"
                  optionFilterProp="children"
                  notFoundContent="无法找到"
                  showSearch={true}
                  onSearch={this.onSearch}
                  searchPlaceholder="输入角色名"
                  onSelect={this.handleAddSelect}
                  >
                  <OptGroup label="分配角色">
                    {options}
                  </OptGroup>
                </Select>
              </FormItem>
              <FormItem label="">
                <Transfer
                  dataSource={this.state.mockData}
                  showSearch
                  listStyle={{
                    width: 300,
                    height: 450,
                  }}
                  titles={this.state.titles}
                  operations={['选入右侧角色组', '选入左侧用户组']}
                  targetKeys={this.state.targetKeys}
                  onChange={this.handleChange}
                  render={this.renderMain}
                  footer={this.renderFooter}
                  />
              </FormItem>
            </Form>
          </div>
        </Modal>
      </Page>
    );
  }
})
  ;


ProjectAuth = createForm()(ProjectAuth);
export default ProjectAuth;
