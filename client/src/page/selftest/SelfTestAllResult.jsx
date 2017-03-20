import './style.less';
import React from 'react';
import {PropTypes} from 'react';
import { Select, message, Form, Input, InputNumber, Modal, Checkbox, Spin, Table } from 'antd'
import * as _ from 'lodash';
import API from '../API';
import Ajax from '../../framework/common/ajax';
import Storage from '../../framework/common/storage';
import PubSubMsg from '../../framework/common/pubsubmsg';
import moment from 'moment';
import { SelfTestResultColumns } from './SelfTestResult';

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
      url: API.SELFTEST_RESULT_HISTORY_BY_ID,
      data: {
        caseId: this.props.caseId
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
      url: API.SELFTEST_RESULT_DETAIL,
      data: {
        projectId: this.props.projectId,
        moduleId:this.props.moduleId,
        version: this.props.version,
        env: this.props.env ? this.props.env : '',
        times: this.props.times ? this.props.times : '',
        userId: this.props.userId ? this.props.userId : '',
        doResult: this.props.doResult ? this.props.doResult : ''
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
  rowKeyMake(a,b,c,d){
    
  },
  render() {
    let columns = [{
      title: '测试结果',
      width: 80,
      key:'1',
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
        title: '实际情况(不通过原因)',
        width: 180,
        key:'2',
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
        key:'3',
        className: "tdAlignCenter",
        dataIndex: 'caseDoUsername'
      }, {
        title: '执行时间',
        width: 90,
        key:'4',
        dataIndex: 'caseDoTime',
        className: "tdAlignCenter",
        render: function (o, row, index) {
          if (o) {
            return (<span>{moment(o).format('YYYY-MM-DD HH:mm') }</span>);
          }
        }
      }];
    let fixColumns = SelfTestResultColumns.getColumns(true);
    fixColumns.splice(0, 0, {
      title: '模块',
      width: 90,
      key:'5',
      dataIndex: 'childModuleName'
    });
    columns = columns.concat(fixColumns);

    return (
      <div style={{ overflow: 'auto' }}>
        <div style={{ maxHeight: 500, minWidth: 1500, overflow: 'auto' }}>
          <Table bordered size="small"  columns={columns}
            rowKey={this.rowKeyMake}
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