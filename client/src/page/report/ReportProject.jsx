import './style.less';
import React from 'react';
import reqwest from 'reqwest';
import { Breadcrumb, Popconfirm, Table, message, Modal, Input, InputNumber, Checkbox, Form, Button, Icon, Tooltip, Tag, Menu, Dropdown  } from 'antd'
import Page from '../../framework/page/Page';
import API from '../API';
import SearchInput from '../ctrl/SearchInput';

let ReportProject = React.createClass({
  getInitialState() {
    return {
      data: [],
      userData: [],
      tableLoading: true,
      loading: true,
      pagination: {
        pageSize: 10
      },
      keywordSearch :""
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
      // url: API.PROJECT_MANAGE,
      url: API.REPORT_PROJECT_CASE,
      method: 'get',
      data: params,
      type: 'json',
      success: (result) => {
        const pagination = this.state.pagination;
        pagination.total = result.total;
        _this.setState({
          tableLoading: false,
          data: result.rows,
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
    this.fetch({
      pageSize: pagination.pageSize,
      currentPage: pagination.current,
      sortField: sorter.field,
      sortOrder: sorter.order,
      keyword : this.state.keywordSearch
    });
  },
  keywordSearch(key) {
    let _this = this;
    this.state.pagination.current = 1;
    _this.setState({
      keyword: key
    });
    _this.setState({
      keywordSearch :key
    })
    _this.fetch({ keyword: key });
  },

  render() {
    const pageHeader =
      <div>
        <h1 className="admin-page-header-title">项目用例统计报表</h1>
        <Breadcrumb>
          <Breadcrumb.Item>
           <Icon type="home" />
          首页
          </Breadcrumb.Item>
          <Breadcrumb.Item>数据统计</Breadcrumb.Item>
          <Breadcrumb.Item>项目用例统计报表</Breadcrumb.Item>
        </Breadcrumb>
      </div>;
    const columns = [{
      title: '项目名称',
      dataIndex: 'projectName',
      width: 240
    }, {
        title: '用例总数',
        dataIndex: 'projectCaseCount',
        width: 150
      }, {
        title: '审核通过用例数',
        dataIndex: 'caseAuditPass',
        width: 150,
        render: function (o, row, index) {
          return (
            <Tag color="green">{o}</Tag>
          );
        }
      }, {
        title: '审核未通过用例数',
        dataIndex: 'caseAuditNoPass',
        width: 150,
        render: function (o, row, index) {
          return (
            <Tag color="yellow">{o}</Tag>
          );
        }
      }, {
        title: '待审核用例数',
        dataIndex: 'caseAuditWait',
        width: 150,
        render: function (o, row, index) {
          return (
            <Tag color="red">{o}</Tag>
          );
        }
      }];

    return (
      <Page header={pageHeader} loading={this.state.loading}>
        <div className="reportproject-bar">
          <SearchInput style={{ width: 210 }} onSearch = {this.keywordSearch} placeholder="输入搜索关键词"/>
        </div>
        <div>
          <Table bordered columns={columns}
            rowKey={record => record._id}
            dataSource={this.state.data}
            pagination={this.state.pagination}
            loading={this.state.tableLoading}
            onChange={this.handleTableChange} />
        </div>

      </Page>
    );
  }
});


export default ReportProject;
