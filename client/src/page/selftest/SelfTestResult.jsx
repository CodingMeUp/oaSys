import './style.less';
import React from 'react';
import {PropTypes} from 'react';
import { Table, Select, Button, Icon, Alert, Tag, message, Modal, Tabs, Spin, Tooltip } from 'antd'
import moment from 'moment';
import Ajax from '../../framework/common/ajax';
import API from '../API';
const Option = Select.Option;
const TabPane = Tabs.TabPane;


export const SelfTestResultColumns = { 
  getColumns: function(isShowBug) {
    const fixColumns = [
      {
        title: '子模块',
        width: 90,
        key:'6',
        dataIndex: 'moduleName'
      }, 
      {
        title: '优先级',
        className: "tdAlignCenter",
        dataIndex: 'casePriority',
        width: 60,
        key:'7',
        render:function(o, row, index){
          return o?o:'低'
        }
      }, 
      {
        title: '编写人',
        width: 70,
        key:'8',
        className: "tdAlignCenter",
        dataIndex: 'createUserName'
      }, 
      {
        title: '用例标题',
        width: 120,
        key:'9',
        dataIndex: 'casePurpose'
      }, {
        title: '前提',
        width: 90,
         key:'10',
        dataIndex: 'casePremise'
      }, {
        title: '步骤',
        width: 60,
         key:'11',
        dataIndex: 'caseStep'
      }, {
        title: '步骤描述',
        width: 180,
         key:'12',
        dataIndex: 'caseStepDesc',
        render: function (o, row, index) {
          if (o) {
            return o.split('\n').map(function(item, index) {              
              return (<p key={'caseStepDesc_' + index}>{item}</p>);
            })
          }
        }
      },{
        title: '期待结果',
        dataIndex: 'caseExpectResult',
        className: "caseExpectResult",
         key:'13',
        render: function (o, row, index) {
          if (o) {
            return o.split('\n').map(function(item, index) {              
              return (<p key={'caseExpectResult_' + index}>{item}</p>);
            })
          }
        }
      }, 
    ];  
    
    return fixColumns;
  },
};

export const CaseDoResultTable = React.createClass({
  getInitialState() {
    return {
      loading: '',
      tableLoading: true,
      data: [],
      pagination: {
        pageSize: 50
      },
      caseInfo: {}
    }
  },
  fetch() {
    let _this = this;
    this.ajax = Ajax.get({
      url: API.CASE_DO_INFO_BY_ID,
      data: {
        id: this.props.doCaseId
      },
      success(res) {
        const result = res.body;        
        if (result.data.caseInfo) {
          const pagination = _this.state.pagination;
          pagination.total = result.data.caseInfo.length;
        }
        _this.setState({
          tableLoading: false,
          data: result.data.caseInfo,
          caseInfo: result.data
        });
      }
    })
  },
  componentDidMount() {
    this.fetch();
  },
  render() {
    let columns = [{
      title: '执行备注',
      width: 80,
      className: "tdAlignCenter",
      dataIndex: 'caseTestResult',
      render(text) {
          return (<Input style={{ color: 'green' }} >{text}</Input>);
      }
    }, {
        title: '实际情况',
        width: 120,
        dataIndex: 'caseTestResultRemark',
        render: function (o, row, index) {
          if (o) {
            return o.split('\n').map(function(item, index) {              
              return (<p key={'caseTestResultRemark_' + index}>{item}</p>);
            })
          }
        }
      }, {
        title: '执行人',
        width: 80,
        className: "tdAlignCenter",
        dataIndex: 'caseDoUsername',
      },
      
      ];
    let fixColumns = SelfTestResultColumns.getColumns(true);
    fixColumns.splice(0, 0, {
        title:'模块',
        width:90,
        dataIndex:'childModuleName'
      });
    columns = columns.concat(fixColumns);
    
    
    const {caseInfo} = this.state;
    const caseDoStatus = caseInfo.isCancel ? (<Tag color="gray">已取消</Tag>) : caseInfo.isComplete ?
      (<Tag color="green">已完成（{moment(caseInfo.completeDate).format('YYYY-MM-DD HH:mm:ss') }）</Tag>) :
      (<Tag color="red">执行中</Tag>);
    const description = (
      <span>
        执行版本：<Tag color="blue">{caseInfo.version}</Tag>
        执行轮数：<Tag color="blue">{caseInfo.times}</Tag>
        
        执行状态：{caseDoStatus}
      </span>
    );

    return (
      <div style={{overflow: 'auto'}}>
        <br />
        <div>
          <Alert message="执行用例基本信息"
            description={description}
            type="info"           
            />
        </div>
        <div style={{maxHeight: 300, minWidth: 1500, overflow: 'auto'}}>
          <Table bordered size="small"  columns={columns}
            rowKey={record => record._id}
            loading={this.state.tableLoading}
            pagination={this.state.pagination}
            dataSource={this.state.data}             
            />
        </div>
      </div>
    );
  }
})
CaseDoResultTable.propTypes = {
  doCaseId: PropTypes.string.isRequired
};

/**
 * 用例执行结果查看
 */
const CaseDoResult = React.createClass({
  getInitialState() {
    return {
      caseDoDetail: [],
      activeKey: this.props.doCaseId ? this.props.doCaseId : 'all',
      useFixedHeader: this.props.useFixedHeader !== undefined ? this.props.useFixedHeader : true,
      loading: true,
      tableLoading: false,
      pagination: {
        pageSize: 50
      }
    }
  },
  fetch() {
    let _this = this;
    Ajax.get({
      url: API.CASE_DO_VERSION_LIST,
      data: {
        moduleId: _this.props.moduleId
      },
      success(res) {
        const result = res.body;

        _this.setState({
          caseDoDetail: result.data,
          loading: false
        });

        setTimeout(function () {
          _this.setState({
            activeKey: _this.props.doCaseId
          });
        }, 500);
      }
    })
  },
  componentDidMount() {
    if (this.props.caseDoDetail) {
      this.setState({
        caseDoDetail: this.props.caseDoDetail,
        loading: false
      });
    } else {
      this.fetch();
    }
  },
  onTabClick(e) {
    this.setState({
      activeKey: e
    })
  },
  render() {
    const data = this.props.caseDoDetail ? this.props.caseDoDetail : this.state.caseDoDetail;

    const tabPane = data.map((item, index) => {
      const tabTitle = (item.isCancel ? "已取消-" : "") + item.version + "（" + item.times + "）";
      return (
        <TabPane tab={tabTitle} key={item._id}>
          <CaseDoResultTable doCaseId={item._id} useFixedHeader={this.state.useFixedHeader} />
        </TabPane>
      )
    });

    const columns = [{
      title: '版本',
      dataIndex: 'version',
      className: "tdAlignCenter",
      width: 90
    }, {
        title: '轮数',
        className: "tdAlignCenter",
        dataIndex: 'times'
      }, {
        title: '总用例数',
        className: "tdAlignCenter",
        dataIndex: 'caseNumber'
      }, {
        title: '通过数',
        className: "tdAlignCenter",
        dataIndex: 'passNumber',
        render: function (o, row, index) {
          return (
            <Tag color="green">{o}</Tag>
          );
        }
      }, {
        title: '不通过数',
        className: "tdAlignCenter",
        dataIndex: 'unPassNumber',
        render: function (o, row, index) {
          return (
            <Tag color="gray">{o}</Tag>
          );
        }
      }, {
        title: '阻塞数',
        className: "tdAlignCenter",
        dataIndex: 'blockNumber',
        render: function (o, row, index) {
          return (
            <Tag color="red">{o}</Tag>
          );
        }
      }, {
        title: '任务分配人',
        dataIndex: 'createUsername'
      }, {
        title: '分配时间',
        dataIndex: 'createDate',
        render: function (o, row, index) {
          return (
            <span>{moment(o).format('YYYY-MM-DD HH:mm:ss') }</span>
          );
        }
      }, {
        title: '执行人',
        dataIndex: 'usernames',
        render: function (o, row, index) {
          const val = o.map((item, index) => {
            return (
              <p>{item}</p>
            )
          });
          return (
            <span>{val}</span>
          );
        }
      }, {
        title: '执行完成时间',
        dataIndex: 'completeDate',
        render: function (o, row, index) {
          if (o) {
            return (
              <span>{moment(o).format('YYYY-MM-DD HH:mm:ss') }</span>
            );
          }
        }
      }, {
        title: '共用时',
        dataIndex: 'totalTime',
        render: function (o, row, index) {
          if (row.completeDate) {
            // console.log(row.completeDate, row.createDate);
            let now = moment(row.completeDate);
            let then = moment(row.createDate);

            // console.log(moment(moment.duration(now.diff(then))).format("HH:mm:ss"))

            let s = now.diff(then, 'hours');
            return s === 0 ? (<Tag color="blue">小于一小时</Tag>) : (<Tag color="blue">{s}小时</Tag>);
          }
        }
      }];


    return (
      <div>
        <Spin spinning={this.state.loading}>
          <Tabs activeKey={this.state.activeKey} onTabClick={this.onTabClick} size="small" tabPosition="left">
            <TabPane tab="执行结果一览" key="all">
              <div>
                <br />
                <Table bordered columns={columns}
                  rowKey={record => record._id}
                  loading={this.state.tableLoading}
                  pagination={this.state.pagination}
                  dataSource={data}
                  />
              </div>
            </TabPane>
            {tabPane}
          </Tabs>
        </Spin>
      </div>
    );
  }
})

CaseDoResult.propTypes = {
  moduleId: PropTypes.string.isRequired,
  doCaseId: PropTypes.string
};

export default CaseDoResult;
