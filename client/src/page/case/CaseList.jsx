import './style.case.less';
import React from 'react';
import { Breadcrumb, Popconfirm, Table, message, Modal, Input, InputNumber, Checkbox, Form, Button, Icon, Tooltip, Tag, Menu, Dropdown } from 'antd'
import Page from '../../framework/page/Page';
import API from '../API';
import Ajax from '../../framework/common/ajax';
import PubSubMsg from '../../framework/common/pubsubmsg';
import Funs from '../../framework/common/functions';
import Storage from '../../framework/common/storage';
import * as _ from 'lodash';

const top_current_project = Funs.top_current_project + '_' + _USERINFO.userId;

let CaseList = React.createClass({
  getInitialState() {
    return {
      loading: false,
      tableLoading: false,
      pagination: {
        pageSize: 20
      },
      data: [],
      pagetitle: ''
    }
  },
  componentDidMount() {
    this.projectId = this.props.location.query.ztModuleId;
    this.moduleId = this.props.location.query.moduleId;
    if (this.projectId || this.moduleId) {
      this.fetchName();
      this.fetch();
    }
    this.ztProductId = this.props.location.query.ztProductId;
    if(this.ztProductId){
      const ztProductId = this.ztProductId;
      PubSubMsg.publish('get_product', {
          ztProductId
      });
    }


  },
  fetchName() {
    let _this = this;
    Ajax.get({
      url: API.PROJECT_INFO_BY_ID,
      data: {
        moduleId: _this.moduleId,
        projectId: _this.projectId
      },
      success(res) {
        const result = res.body;
        let pagetitle = [];
        if (result.data.projectName) {
          pagetitle.push(result.data.projectName);
        }
        if (result.data.moduleName) {
          pagetitle.push(result.data.moduleName);
        }


        _this.setState({
          pagetitle: pagetitle.join('-')
        })
      }
    })
  },
  fetch(params = {}) {
    let _this = this;
    params.navigateType = "product";
    if (_this.projectId) {
      params.project = _this.projectId;
    }
    if (_this.moduleId) {
      params.module = _this.moduleId;
    }
    Ajax.get({
      url: API.CASE_EXCELJSON,
      data: params,
      before() {
        _this.setState({
          tableLoading: true
        })
      },
      success(res) {
        const result = res.body;
        const pagination = _this.state.pagination;
        pagination.total = result.total;

        _this.setState({
          data: result.data,
          tableLoading: false,
          //pagetitle: 'test',
          pagination
        })
      }
    })
  },
  handleTableChange(pagination, filters, sorter) {
    const pager = this.state.pagination;
    pager.current = pagination.current;
    this.setState({
      pagination: pager,
    });
    this.fetch({
      limit: pagination.pageSize,
      offset: (pagination.current - 1) * pagination.pageSize
    });
  },
  render() {
    const pageHeader =
      <div>
        <h1 className="admin-page-header-title" ref="pageTitle">用例浏览( {this.state.pagetitle})</h1>
        <Breadcrumb>
          <Breadcrumb.Item>
            <Icon type="home" />
            首页
          </Breadcrumb.Item>
          <Breadcrumb.Item>用例管理</Breadcrumb.Item>
          <Breadcrumb.Item>用例浏览</Breadcrumb.Item>
        </Breadcrumb>
      </div>
      ;


    const columnsCase = [{
      title: '子模块',
      dataIndex: 'moduleName',
      width: 80
    }, {
      title: '用例标题',
      dataIndex: 'casePurpose'
    }, {
      title: '前提',
      dataIndex: 'casePremise'
    }, {
      title: '步骤',
      width: 50,
      dataIndex: 'caseStep'
    }, {
      title: '步骤描述',
      className: "caseExpectResult",
      dataIndex: 'caseStepDesc'
    }, {
      title: '期待结果',
      className: "caseExpectResult",
      dataIndex: 'caseExpectResult'
    }, {
      title: '优先级',
      className: "tdAlignCenter",
      dataIndex: 'casePriority'
    }, {
      title: '编写人',
      className: "tdAlignCenter",
      dataIndex: 'createUser',
      render: function (o, row) {
        return row.createUser ? row.createUser.nick_name : row.createUser;
      }
    }, {
      title: '编写日期',
      className: "tdAlignCenter",
      dataIndex: 'createDateFormat'
    }];

    return (
      <Page ref="pageTitle" header={pageHeader} loading={this.state.loading}>
        <div>
          <Table bordered columns={columnsCase}
            rowKey={record => record._id}
            onRowClick={this.onRowClick}
            loading={this.state.tableLoading}
            pagination={this.state.pagination}
            dataSource={this.state.data}
            onChange={this.handleTableChange}
            />
        </div>
      </Page>
    );
  }
});


export default CaseList;
