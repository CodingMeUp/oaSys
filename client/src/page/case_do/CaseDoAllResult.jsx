import './style.less';
import React from 'react';
import { PropTypes } from 'react';
import { Select, message, Form, Input, InputNumber, Modal, Checkbox, Spin, Table } from 'antd'
import * as _ from 'lodash';
import API from '../API';
import Ajax from '../../framework/common/ajax';
import Storage from '../../framework/common/storage';
import PubSubMsg from '../../framework/common/pubsubmsg';
import moment from 'moment';
import { CaseDoResultColumns } from './CaseDoResult';
import Funs from '../../framework/common/functions';

const top_current_project = Funs.top_current_project + '_' + _USERINFO.userId;
const CaseDoAllResult = React.createClass({
  getInitialState() {
    return {
      tableLoading: true,
      data: [],
      pagination: {
        pageSize: 50
      }
    }
  },
  componentWillUnmount() {

  },
  componentDidMount() {
    if (this.props.fetchByCaseId) {
      this.fetchByCaseId();
    } else {
      this.fetch();
    }
  },
  fetchByCaseId() {
    let _this = this;
    this.ajax = Ajax.get({
      url: API.CASE_DO_RESULT_HISTORY_BY_ID,
      data: {
        caseId: this.props.caseId,
        type: Storage.local.get(top_current_project) ? Storage.local.get(top_current_project).type : null
      },
      success(res) {
        const result = res.body;
        _this.setState({
          tableLoading: false,
          data: result.data
        });
      }
    })
  },
  fetch() {
    let _this = this;
    this.ajax = Ajax.get({
      url: API.CASE_DO_RESULT_DETAIL,
      data: {
        projectId: this.props.projectId,
        version: this.props.version,
        env: this.props.env ? this.props.env : '',
        times: this.props.times ? this.props.times : '',
        userId: this.props.userId ? this.props.userId : '',
        doResult: this.props.doResult ? this.props.doResult : '',
        type: Storage.local.get(top_current_project) ? Storage.local.get(top_current_project).type : null,
        isHistory: this.props.isHistory ? this.props.isHistory : false
      },
      success(res) {
        const result = res.body;
        if (result.data.caseInfo) {
          const pagination = _this.state.pagination;
          pagination.total = result.data.caseInfo.length;
        }
        _this.setState({
          tableLoading: false,
          data: result.data
        });
      }
    })
  },
  render() {
    let columns = [{
      title: '测试结果',
      width: 80,
      className: "tdAlignCenter",
      dataIndex: 'caseTestResult',
      render(text) {
        if (text === '不通过') {
          return (<span style={{ color: 'gray' }}>{text}</span>);
        } else if (text === '阻塞') {
          return (<span style={{ color: 'red' }}>{text}</span>);
        } else {
          return (<span style={{ color: 'green' }}>{text}</span>);
        }
      }
    }, {
      title: '实际情况',
      width: 120,
      dataIndex: 'caseTestResultRemark',
      render: function (o, row, index) {
        if (o) {
          return o.split('\n').map(function (item, index) {
            return (<p key={'caseTestResultRemark_' + index}>{item}</p>);
          })
        }
      }
    }, {
      title: '执行人',
      width: 80,
      className: "tdAlignCenter",
      dataIndex: 'caseDoUsername'
    }, {
      title: '执行时间',
      width: 90,
      dataIndex: 'caseDoTime',
      className: "tdAlignCenter",
      render: function (o, row, index) {
        if (o) {
          return (<span>{moment(o).format('YYYY-MM-DD HH:mm')}</span>);
        }
      }
    }];
    let fixColumns = CaseDoResultColumns.getColumns(true);
    fixColumns.splice(0, 0, {
      title: '模块',
      width: 90,
      dataIndex: 'childModuleName'
    });
    columns = columns.concat(fixColumns);

    return (
      <div style={{ overflow: 'auto' }}>
        <div style={{ maxHeight: 500, minWidth: 1500, overflow: 'auto' }}>
          <Table bordered size="small" columns={columns}
            rowKey={record => record._id}
            loading={this.state.tableLoading}
            pagination={this.state.pagination}
            dataSource={this.state.data}
            />
        </div>
      </div>
    );
  }
});



export default CaseDoAllResult;