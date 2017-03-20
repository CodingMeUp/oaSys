import './style.less';
import React from 'react';
import reqwest from 'reqwest';
import { Breadcrumb, Popconfirm, Table, Select, message, Modal, Input, InputNumber, Checkbox, Form, Button, Icon, Tooltip, Tag, Menu, Dropdown  } from 'antd'
import Page from '../../framework/page/Page';
import API from '../API';
import Storage from '../../framework/common/storage';
import SearchInput from '../ctrl/SearchInput';
const Option = Select.Option;
const OptGroup = Select.OptGroup;
const CheckboxGroup = Checkbox.Group;
const FormItem = Form.Item;
const createForm = Form.create;
const confirm = Modal.confirm;

let currentRow;

let UserAuth = React.createClass({
  stateValue: {},
  getInitialState() {
    return {
      data: [],
      tableLoading: true,
      loading: true,
      keyword: '',
      modalVisible: false,
      confirmLoading: false,
      modalTitle: '设置用户权限',
      allRoles: [],
      pagination: {},
    }
  },
  componentDidMount() {
    this.setState({ loading: false });
    this.fetch();
  },
  fetch(params = {}) {
    let _this = this;
    this.setState({ tableLoading: true });
    reqwest({
      url: API.USER_ROLE,
      method: 'get',
      data: params,
      type: 'json',
      success: (result) => {
        const pagination = this.state.pagination;
        pagination.total = result.total;
        const defaultExpandedRowKeys = [];
        result.rows.forEach(item => {
          defaultExpandedRowKeys.push(item._id);
        });
        _this.setState({
          tableLoading: false,
          data: result.rows,
          defaultExpandedRowKeys: defaultExpandedRowKeys,
          pagination
        });


      }
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

  ////新增模块
  createModal(row) {
    let _this = this;
    let array = [];
    array.push(row.role_id ? row.role_id : '1');
    _this.props.form.setFieldsValue({
      userid: row.user_id,
      usersName: row.nick_name,
      operName: row.oper_name,
      allRoles: array
    });
    _this.setState({
      modalVisible: true,
      allRoles: row.allRoles
    });

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
  //Modal 保存
  handleOk() {
    let _this = this;
    _this.stateValue._id = _this.props.form.getFieldValue('userid');
    let tempRoleID = _this.props.form.getFieldValue('allRoles');
    for (var i = 0; i < _this.state.allRoles.length; i++) {
      if (_this.state.allRoles[i].role_id == tempRoleID) {
        _this.stateValue.nowRoleName = _this.state.allRoles[i].role_name;
      }
    }
    reqwest({
      url: API.USER_AUTH_MODIFY,
      method: 'post',
      contentType: 'application/json',
      data: JSON.stringify(_this.stateValue),
      type: 'json',
      success: (result) => {
        _this.fetch({ keyword: this.state.keyword, pageSize: 500 });
        _this.setState({
          modalVisible: false,
          tableLoading: false
        });
        _this.showSuccessMessage();
      }
    });
  },
  handleChange(value, label) {
    let _this = this;
    let array = [];
    array.push(value);
    _this.props.form.setFieldsValue({
      allRoles: array
    });
  },
  // Modal 取消
  handleCancel(e) {
    let _this = this;
    _this.setState({
      modalVisible: false
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

    var str = '';
    for (var i = 0; i < o.length; i++) {
      if (i == o.length - 1) {
        str += str + '【' + o[i] + '】';
      } else {
        str += '【' + o[i] + '】';
      }
    }
    return str;
  },
  //添加操作按钮
  projectOptFun(o, row, index) {
    return (
      <div><a type="primary" onClick={this.createModal.bind(this, row) }>
        <Icon type="setting"/>
        设置用户权限
      </a>
      </div>
    );
  },
  render() {
    const pageHeader =
      <div>
        <h1 className="admin-page-header-title">用户权限分配</h1>
        <Breadcrumb>
          <Breadcrumb.Item>
            <Icon type="home" />
            首页
          </Breadcrumb.Item>
          <Breadcrumb.Item>用户权限分配</Breadcrumb.Item>
        </Breadcrumb>
      </div>;

    const columns = [{
      title: '工号',
      dataIndex: 'user_id',
      width: 80
    }, {
        title: '姓名',
        dataIndex: 'nick_name',
        width: 90
      }, {
        title: '所在部门组别',
        dataIndex: 'node_name',
        width: 220,
        className: "nodeNameClz"
      }, {
        title: '所属权限组',
        dataIndex: 'role_name',
        width: 200
      }, {
        title: '拥有的权限',
        dataIndex: 'oper_name',
        width: 480,
        render: this.operNameOpt
      }, {
        title: '',
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
            value={d.role_id} disabled>{d.role_name}---{d.role_remark}
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
        <div className="project-bar">
          <div className="project-fr">
          </div>
          <SearchInput style={{ width: 210 }} onSearch={this.keywordSearch} placeholder="输入搜索关键词"/>
        </div>
        <div>
          <Table bordered columns={columns}
            rowKey={record => record.user_id}
            dataSource={this.state.data}
            defaultExpandedRowKeys={this.state.defaultExpandedRowKeys}
            pagination={this.state.pagination}
            loading={this.state.tableLoading}
            onChange={this.handleTableChange}/>
        </div>

        <Modal maskClosable={false} title={this.state.modalTitle} width={610} visible={this.state.modalVisible}
          onOk={this.handleOk} onCancel={this.handleCancel}>
          <div className="userAuthForm">
            <Form horizontal form={this.props.form}>
              <FormItem label="工号：">
                <Input  {...useridProps} style={{ width: 580, color: 'black' }} disabled/>
              </FormItem>
            </Form>

            <Form horizontal>
              <FormItem label="姓名：">
                <Input  {...usersNameProps} style={{ width: 580, color: 'black' }} disabled/>
              </FormItem>
            </Form>

            <Form horizontal>
              <FormItem label="当前拥有的操作权限：">
                <Input  {...operNameProps} style={{ width: 580, color: 'black' }} disabled/>
              </FormItem>
            </Form>
            <Form horizontal>
              <FormItem label="所属角色权限组: （可修改）">
                <Select  {...allRolesProps} showSearch allowClear
                  style={{ width: 580 }}
                  placeholder="请选择人员"
                  optionFilterProp="children"
                  notFoundContent="无法找到"
                  searchPlaceholder="输入关键词"
                  onChange={this.handleChange}
                  >
                  <OptGroup label="分配角色">
                    {options}
                  </OptGroup>
                </Select>
              </FormItem>
            </Form>
          </div>
        </Modal>
      </Page>
    );
  }
})
  ;


UserAuth = createForm()(UserAuth);
export default UserAuth;
