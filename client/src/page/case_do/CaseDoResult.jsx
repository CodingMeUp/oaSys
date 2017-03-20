import './style.less';
import React from 'react';
import {PropTypes} from 'react';
import { Table, Select, Button, Icon, Alert, Tag, message, Modal, Tabs, Spin, Tooltip } from 'antd'
import moment from 'moment';
import _ from 'lodash';
import Ajax from '../../framework/common/ajax';
import API from '../API';
import Storage from '../../framework/common/storage';
import Funs from '../../framework/common/functions';
const Option = Select.Option;
const TabPane = Tabs.TabPane;
const top_current_project = Funs.top_current_project +'_'+_USERINFO.userId;



export const CaseDoResultColumns = {
  getColumns: function (isShowBug) {
    const fixColumns = [
      {
        title: '子模块',
        width: 90,
        dataIndex: 'moduleName'
      }, {
        title: '用例标题',
        width: 90,
        dataIndex: 'casePurpose'
      }, {
        title: '前提',
        width: 90,
        dataIndex: 'casePremise'
      }, {
        title: '步骤',
        width: 60,
        dataIndex: 'caseStep'
      }, {
        title: '步骤描述',
        width: 180,
        dataIndex: 'caseStepDesc',
        render: function (o, row, index) {
          if (o) {
            return o.split('\n').map(function (item, index) {
              return (<p key={'caseStepDesc_' + index}>{item}</p>);
            })
          }
        }
      }, {
        title: '期待结果',
        dataIndex: 'caseExpectResult',
        className: "caseExpectResult",
        render: function (o, row, index) {
          if (o) {
            return o.split('\n').map(function (item, index) {
              return (<p key={'caseExpectResult_' + index}>{item}</p>);
            })
          }
        }
      }, {
        title: '编写人',
        width: 70,
        className: "tdAlignCenter",
        dataIndex: 'createUserName'
      }, {
        title: '优先级',
        className: "tdAlignCenter",
        dataIndex: 'casePriority',
        width: 80,
        filters: [{
          text: '高',
          value: '高',
        }, {
            text: '中',
            value: '中',
          }, {
            text: '低',
            value: '低',
          }],
        filterMultiple: true,
        onFilter: (value, record) => record.casePriority === value
      },
    ];

    if (isShowBug) {
      const _this = this;
      fixColumns.splice(0, 0, {
        title: '关联BUG',
        width: 120,
        dataIndex: 'bugId',
        render: function (o, row, index) {
          const loop = data => data.map((item) => {
            const bugInfo = CaseDoResultColumns.renderBugInfo(item);
            const bugUrl = bugInfo.bugUrl;
            const bugSeverityStr = bugInfo.bugSeverityStr;
            if (item.bugId) {
              return (
                <p>
                  <Tooltip placement="right" title={(<span>严重程度：{bugSeverityStr}<br/>标题：{item.bugTitle}</span>) }>
                    <Tag ><a href={bugUrl} target="_blank"><strong>ID: {item.bugId}</strong></a></Tag>
                  </Tooltip>
                </p>
              )
            }
            return;
          });

          if (o) {
            const bugInfo = _this.renderBugInfo(row);
            let bugSeverityStr = bugInfo.bugSeverityStr;
            let bugUrl = bugInfo.bugUrl;;
            let bugTitle = row.bugTitle;
            return (
              <div>
                <p>
                  <Tooltip placement="right" title={(<span>严重程度：{bugSeverityStr}<br/>标题：{bugTitle}</span>) }>
                    <Tag><a href={bugUrl} target="_blank"><strong>ID: {o}</strong></a></Tag>
                  </Tooltip>
                </p>
              </div>
            )
          } else {
            return (
              <div>
                {loop(row.bugInfo) }
              </div>
            )
          }
        }
      });
    }

    return fixColumns;
  },
  renderBugInfo: function (row) {
    const bugFrom = row.bugFrom;
    const bugSeverity = row.bugSeverity;
    let bugSeverityStr = '';
    // let bugUrl = 'http://pms.sdp.nd/index.php?m=bug&f=view&id=' + row.bugId;
    let bugUrl = '/client#/bug/view/' + row.bugId;
    if (bugFrom === 'HUAYU') {
      bugUrl = 'http://pms.101.com/index.php?m=bug&f=view&id=' + row.bugId;
    }
    if (bugFrom === 'HUAYU' || bugFrom === 'SDP') {
      if (bugSeverity == 1) {
        bugSeverityStr = '建议';
      } else if (bugSeverity == 2) {
        bugSeverityStr = '轻微';
      } else if (bugSeverity == 3) {
        bugSeverityStr = '一般';
      } else if (bugSeverity == 4) {
        bugSeverityStr = '严重';
      } else if (bugSeverity == 5) {
        bugSeverityStr = '致命';
      }
    }

    return {
      bugSeverityStr: bugSeverityStr,
      bugUrl: bugUrl
    };
  }
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
        id: this.props.doCaseId,
        type: Storage.local.get(top_current_project) ? Storage.local.get(top_current_project).type : null
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
        dataIndex: 'caseDoUsername',
      },

    ];
    let fixColumns = CaseDoResultColumns.getColumns(true);
    fixColumns.splice(0, 0, {
      title: '模块',
      width: 90,
      dataIndex: 'childModuleName'
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
        任务分配人：<Tag color="green">{caseInfo.createUsername}({caseInfo.createUser}) </Tag>
        分配时间：<Tag color="yellow">{moment(caseInfo.createDate).format('YYYY-MM-DD HH:mm:ss') }</Tag>
        执行状态：{caseDoStatus}
      </span>
    );

    return (
      <div style={{ overflow: 'auto' }}>
        <br />
        <div>
          <Alert message="执行用例基本信息"
            description={description}
            type="info"
            />
        </div>
        <div style={{ maxHeight: 450, minWidth: 1500, overflow: 'auto' }}>
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
        moduleId: _this.props.moduleId,
        type:Storage.local.get(top_current_project) ? Storage.local.get(top_current_project).type : null
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


    let tabPane = []; // 做倒序
    for (var i = data.length-1;i>=0; i--) {
       var item = data[i];
        var type = Storage.local.get(top_current_project) ? Storage.local.get(top_current_project).type : null;
        if(type && type=="product"){
          const tabTitle = (item.isCancel ? "已取消-" : "") +item.ztModuleName+",版本：" +item.version + "，轮数：" + item.times ;
           tabPane.push(
            <TabPane tab={tabTitle} key={item._id}>
              <CaseDoResultTable doCaseId={item._id} useFixedHeader={this.state.useFixedHeader} />
            </TabPane>
          )
        }else{
          const tabTitle = (item.isCancel ? "已取消-" : "") +"版本：" +item.version + "，轮数：" + item.times ;
           tabPane.push(
            <TabPane tab={tabTitle} key={item._id}>
              <CaseDoResultTable doCaseId={item._id} useFixedHeader={this.state.useFixedHeader} />
            </TabPane>
          )
        }
    };

    const columns = [{
      title: '版本',
      dataIndex: 'version',
      className: "tdAlignCenter",
      width: 90
    }, {
        title: '轮数',
        className: "tdAlignCenter",
        dataIndex: 'times',
        width: 60
      }, {
        title: '总用例数',
        className: "tdAlignCenter",
        dataIndex: 'caseNumber',
        width: 80
      }, {
        title: '通过数',
        className: "tdAlignCenter",
        dataIndex: 'passNumber',
        width: 80,
        render: function (o, row, index) {
          return (
            <Tag color="green">{o}</Tag>
          );
        }
      }, {
        title: '不通过数',
        className: "tdAlignCenter",
        dataIndex: 'unPassNumber',
        width: 80,
        render: function (o, row, index) {
          return (
            <Tag color="yellow">{o}</Tag>
          );
        }
      }, {
        title: '阻塞数',
        className: "tdAlignCenter",
        dataIndex: 'blockNumber',
        width: 80,
        render: function (o, row, index) {
          return (
            <Tag color="red">{o}</Tag>
          );
        }
      }, {
        title: '任务分配人',
        dataIndex: 'createUsername',
        width: 80
      }, {
        title: '分配时间',
        dataIndex: 'createDate',
        width: 100,
        render: function (o, row, index) {
          return (
            <span>{moment(o).format('YYYY-MM-DD HH:mm:ss') }</span>
          );
        }
      }, {
        title: '执行人',
        dataIndex: 'usernames',
        width: 80,
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
        width: 100,
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
        width: 80,
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
      <div className='tabClz'>
        <Spin spinning={this.state.loading}>
          <Tabs activeKey={this.state.activeKey} onTabClick={this.onTabClick} size="small" tabPosition="left">
            <TabPane tab="执行结果一览" key="all">
              <div style={{ maxHeight: 550, overflow: 'auto' }}>
                <br />
                <Table bordered columns={columns}
                  rowKey={record => record._id}
                  useFixedHeader={true}
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
