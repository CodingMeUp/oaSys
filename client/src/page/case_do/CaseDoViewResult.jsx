import './style.less';
import React from 'react';
import ReactDOM from 'react-dom';
import { Alert, Icon, Spin, Table, Tag, Modal, Tooltip, Progress } from 'antd'
import moment from 'moment';
import Ajax from '../../framework/common/ajax';
import PubSubMsg from '../../framework/common/pubsubmsg';
import ProjectTree from '../case/ProjectTree';
import CaseDoResult from './CaseDoResult';
import CaseDoAllResult from './CaseDoAllResult';
import { ProjectVersionTimesTree, OnProSelect } from './ProjectVersionTimesTree';
import API from '../API';
import UiCtrl from '../utils/UiCtrl';
import Storage from '../../framework/common/storage';
import Funs from '../../framework/common/functions';
/**
 * 用例执行结果查看页面
 */
const top_current_project = Funs.top_current_project + '_' + _USERINFO.userId;
const CaseDoViewResult = React.createClass({
  getInitialState() {
    return {
      loading: false,
      selectModuleName: '',
      type: '',
      moduleId: '',
      caseDoDetail: [],
      tableLoading: false,
      pagination: {
        pageSize: 50
      },
      defaultExpandedRowKeys: [],
      data: [],
      newData: {},//版本/环境的数据汇总
      timesData: {},//轮数的数据
      loadingIcon: 'reload',
      expandedKeys: [],
      env: null
    }
  },
 componentWillUnmount() {
    PubSubMsg.unsubscribe('get_current_project');

  },
  componentDidMount() {
    // this.doContent = ReactDOM.findDOMNode(this.refs.doContent);
     const _this = this;
     PubSubMsg.subscribe('get_current_project', function (resData) {
      //顶部产品、项目变化时，中间及右侧用例执行页面显示为空
      _this.setState({
          tableLoading: false,
          data: [],
          newData: {}

         
      })
    });
  },
  fetch(moduleId) {
    let _this = this;
    Ajax.get({
      url: API.CASE_DO_VERSION_LIST,
      data: {
        moduleId: moduleId
      },
      before() {
        _this.setState({
          loading: true
        });
      },
      success(res) {
        const result = res.body;

        _this.setState({
          caseDoDetail: result.data,
          loading: false
        });
      }
    })
  },
  onTreeSelect(info, e, node, event) {
    const nodeData = e.node.props.nodeData;
    if (nodeData.children) {
      this.setState({
        moduleId: '',
        selectModuleName: ''
      })
    } else {
      this.setState({
        moduleId: nodeData.moduleId,
        selectModuleName: nodeData.moduleName
      })

      this.fetch(nodeData.moduleId);
    }
  },
  reloadTree() {
    const _this = this;
    this.setState({
      loadingIcon: 'loading'
    })
    setTimeout(function () {
      _this.setState({
        loadingIcon: 'reload'
      })
    }, 300);
    PubSubMsg.publish('refresh-project-version-tree-data', {});
  },
  fetchData(selectName, projectId, version, env, times) {
    let data = {
      projectId: projectId,
      type: 'project'
    };
    if (version) {
      data.version = version;
      data.type = 'version';
    }
    if (env) {
      data.version = version;
      data.env = env;
      data.type = 'env';
    }
    if (times) {
      data.version = version;
      data.env = env;
      data.times = times;
      data.type = 'times';
    }

    if (Storage.local.get(top_current_project)) {
      data.proType = Storage.local.get(top_current_project).type
    } else {
      data.proType = null
    }

    let _this = this;
    Ajax.get({
      url: API.CASE_DO_RESULT,
      data: data,
      before() {
        _this.setState({
          tableLoading: true
        })
      },
      success(res) {
        const result = res.body;
        var resultInfo = result.data.data;//每轮的执行数据
        let nows = null, then = null, planTimes = '', doTimes = '';
        let planTotalTimes = 0, doTotalTimes = 0;        

        //这个是计算每一条轮数的数据
        if (resultInfo && resultInfo.length > 0) {
          for (var i = 0; i < resultInfo.length; i++) {
            //计算-每轮的计划时数
            if (resultInfo[i].planEndDate && resultInfo[i].planStartDate) {
              nows = moment(resultInfo[i].planEndDate, 'YYYY-M-D H:mm');
              then = moment(resultInfo[i].planStartDate, 'YYYY-M-D H:mm');

              planTimes = nows.diff(then, 'hours',true);
              if (planTimes) {
                planTotalTimes = planTotalTimes + (+planTimes);//把每一轮的计划时间相加
              }

            }
            //计算-每轮的实际时数
            if (resultInfo[i].createDate && resultInfo[i].endDate) {
              nows = moment(resultInfo[i].endDate, 'YYYY-M-D H:mm');
              then = moment(resultInfo[i].createDate, 'YYYY-M-D H:mm');

              doTimes = nows.diff(then, 'hours',true);
              if (doTimes) {
                doTotalTimes = doTotalTimes + (+doTimes);//每一轮的实际时间相加
              }
            }            
            resultInfo[i].planTimes = planTimes ? (planTimes.toFixed(1) + '小时') : '0小时';
            resultInfo[i].doTimes = doTimes ? (doTimes.toFixed(1) + '小时') : ((resultInfo[i].endDate != '进行中' && resultInfo[i].endDate != '未分配') ? '小于一小时' : '- -');
            //如果点击的是轮数
            if (times) {
              if (resultInfo[i].planStartDate && resultInfo[i].planEndDate) {
                _this.state.timesData.planStartDate = resultInfo[i].planStartDate;
                _this.state.timesData.planEndDate = resultInfo[i].planEndDate;
                _this.state.timesData.planTotalTimes = planTotalTimes ? planTotalTimes : '0';
              }

              if (resultInfo[i].children && resultInfo[i].children.length > 0) {
                for (var j = 0; j < resultInfo[i].children.length; j++) {
                  if (resultInfo[i].children[j].createDate && resultInfo[i].children[j].endDate) {
                    nows = moment(resultInfo[i].children[j].endDate, 'YYYY-M-D H:mm');
                    then = moment(resultInfo[i].children[j].createDate, 'YYYY-M-D H:mm');

                    var userDoTimes = nows.diff(then, 'hours',true);
                    resultInfo[i].children[j].doTimes = userDoTimes ? (userDoTimes.toFixed(1) + '小时') : ((resultInfo[i].children[j].endDate != '进行中' && resultInfo[i].children[j].endDate != '未分配') ? '小于一小时' : '- -');
                  }
                }
              }
            }
          }
        }

        //这个是计算总数据
        var versionInfo = result.data.newData[0];        
        if (versionInfo) {
          //计划时间逻辑判断
          if (versionInfo.planStartDate == '' || versionInfo.planEndDate == '') {
            versionInfo.planStartDate = '未配置';
            versionInfo.planEndDate = '未配置';
            versionInfo.planTotalTimes = '0';
          } else {
            versionInfo.planTotalTimes = planTotalTimes.toFixed(1);//计划共用时
          }
          //实际时间执行判断
          if (versionInfo.startDate == '') {
            //如果没有开始时间则，都设置为‘未分配’
            versionInfo.startDate = '未分配';
            versionInfo.completeDate = '未分配';
            versionInfo.doTotalTimes = '0小时';
          } else {
            if (versionInfo.isComplete == false) {
              //如果有开始时间，并且没有全部执行完成
              versionInfo.completeDate = '进行中';
              versionInfo.doTotalTimes = '- -';
            } else {
              //如果有开始时间也有结束时间
              versionInfo.doTotalTimes = (doTotalTimes == 0) ? '小于一小时' : (doTotalTimes.toFixed(1) + '小时');
            }
          }
        }
        _this.setState({
          tableLoading: false,
          data: resultInfo,
          newData: versionInfo,
          defaultExpandedRowKeys: result.data.defaultExpandedRowKeys,
          selectModuleName: selectName,
          type: data.type,
          env: result.data.hasEnv,
          expandedKeys: [..._this.state.expandedKeys]
        })
      }
    })
  },
  onSelect(info, e, node, event) {
    const nodeData = e.node.props.nodeData;

    if (nodeData.type === 'project') {
      this.fetchData(nodeData.name, nodeData.id);
    } else if (nodeData.type === 'version') {
      this.fetchData(nodeData.name, nodeData.projectId, nodeData.version);
    } else if (nodeData.type === 'env') {
      this.fetchData(nodeData.name, nodeData.projectId, nodeData.version, nodeData.env);
    } else if (nodeData.type === 'times') {
      this.fetchData(nodeData.name, nodeData.projectId, nodeData.version, nodeData.env, nodeData.times);
    }
    if (nodeData.type !== 'times') {
      let expandedKeys = [...this.state.expandedKeys];
      let index = expandedKeys.indexOf(nodeData.id);

      if (index > -1) {
        expandedKeys.splice(index, 1);
      } else {
        expandedKeys.push(nodeData.id);
      }
      this.setState({
        expandedKeys
      })
    }
  },
  onExpandTree(expandedKeys) {
    this.setState({ expandedKeys });
  },
  onExpanded(expanded, record) {
    let keys = [...this.state.defaultExpandedRowKeys];
    if (expanded) {
      keys.push(record._id);
    } else {
      var index = keys.indexOf(record._id);

      if (index > -1) {
        keys.splice(index, 1);
      }
    }
    this.setState({
      defaultExpandedRowKeys: keys
    })
  },
  showDoResultDetail(o, doResult, row, e) {     
    if (+o > 0) {
      Modal.info({
        title: '用例执行结果',
        width: '96%',
        content: (
          <CaseDoAllResult doResult={doResult} projectId={row.projectId} version={row.version} env={row.env} times={row.times} userId={row.caseDoUser} />
        ),
        onOk() { },
      });
    }
  },
  renderTGS(o, row, index) {
    return (
      <Tooltip placement='bottom' title='查看明细'>
        <Tag color="green" className="detailSpanStyle"><a onClick={this.showDoResultDetail.bind(this, o, '通过', row)}>{o}</a></Tag>
      </Tooltip>
    );
  },
  renderBTGS(o, row, index) {
    return (
      <Tooltip placement='bottom' title='查看明细'>
        <Tag color="yellow" className="detailSpanStyle"><a onClick={this.showDoResultDetail.bind(this, o, '不通过', row)}>{o}</a></Tag>
      </Tooltip>
    );
  },
  renderZSS(o, row, index) {
    return (
      <Tooltip placement='bottom' title='查看明细'>
        <Tag color="red" className="detailSpanStyle"><a onClick={this.showDoResultDetail.bind(this, o, '阻塞', row)}>{o}</a></Tag>
      </Tooltip>
    );
  },
  renderYLS(o, row, index) {
    return (
      <Tooltip placement='bottom' title='查看明细'>
        <Tag className="detailSpanStyle"><a onClick={this.showDoResultDetail.bind(this, o, null, row)}>{o}</a></Tag>
      </Tooltip>
    );
  },
  render() {
    const {selectModuleName, newData, timesData} = this.state;
    const _this = this;
    let columns = [{
      title: '版本',
      width: 130,
      dataIndex: 'version'
    }, {
      title: '轮数',
      width: 60,
      className: "tdAlignCenter",
      dataIndex: 'times'
    }, {
      title: '进度',
      className: "tdAlignCenter",
      render: function (o, row, index) {
        let percentNum = parseInt(0);

        if (parseInt(row.caseNumber) > 0) {
          percentNum = parseInt(row.doNumber / row.caseNumber * 100);
        }

        return (
          <Progress type="circle" width={30} format={percent => percent} percent={percentNum} />
        );
      }
    }, {
      title: '用例数',
      className: "tdAlignCenter",
      dataIndex: 'caseNumber',
      render: this.renderYLS
    }, {
      title: '已执行数',
      className: "tdAlignCenter",
      dataIndex: 'doNumber'
    }, {
      title: '通过数',
      className: "tdAlignCenter",
      dataIndex: 'passNumber',
      render: this.renderTGS
    }, {
      title: '不通过数',
      className: "tdAlignCenter",
      dataIndex: 'unPassNumber',
      render: this.renderBTGS
    }, {
      title: '阻塞数',
      className: "tdAlignCenter",
      dataIndex: 'blockNumber',
      render: this.renderZSS
    }];

    if (newData) {
      if (this.state.type === 'version' || this.state.type === 'env') {
        columns.splice(columns.length, 0, {
          width: 145,
          title: '计划开始~结束时间',
          className: "tdAlignCenter",
          dataIndex: 'planStartEndDate'
        });
        columns.splice(columns.length, 0, {
          width: 90,
          title: '计划用时',
          className: "tdAlignCenter",
          dataIndex: 'planTimes'
        });
        columns.splice(columns.length, 0, {
          width: 135,
          title: '任务开始时间',
          className: "tdAlignCenter",
          dataIndex: 'createDate'
        });
        columns.splice(columns.length, 0, {
          width: 135,
          title: '任务结束时间',
          className: "tdAlignCenter",
          dataIndex: 'endDate'
        });
        columns.splice(columns.length, 0, {
          width: 90,
          title: '实际用时',
          className: "tdAlignCenter",
          dataIndex: 'doTimes'
        });
        columns.splice(columns.length, 0, {
          width: 90,
          title: '提交BUG数',
          className: "tdAlignCenter",
          dataIndex: 'bugNumber'
        });
      }
    }


    if (this.state.type === 'times') {
      columns.splice(2, 0, {
        title: '执行人',
        className: "tdAlignCenter",
        dataIndex: 'caseDoUsername'
      });
      columns.splice(columns.length, 0, {
        width: 160,
        title: '任务开始时间',
        className: "tdAlignCenter",
        dataIndex: 'createDate'
      });
      columns.splice(columns.length, 0, {
        width: 160,
        title: '任务结束时间',
        className: "tdAlignCenter",
        dataIndex: 'endDate'
      });
      columns.splice(columns.length, 0, {
        width: 90,
        title: '实际用时',
        className: "tdAlignCenter",
        dataIndex: 'doTimes'
      });
      columns.splice(columns.length, 0, {
        width: 160,
        title: '提交BUG数',
        className: "tdAlignCenter",
        dataIndex: 'bugNumber'
      });
    }
    if (this.state.env) {
      columns.splice(2, 0, {
        title: '环境',
        width: 100,
        className: "tdAlignCenter",
        dataIndex: 'env'
      });
    }

    const showVersionNum = this.state.type === 'project' ? { display: '' } : { display: 'none' };

    let versionAlert = '';

    if (newData && this.state.type === 'version') {

      let description = (
        <span>
          <strong>版本执行信息>  </strong>
          创建总轮数：<Tag color="blue">{newData.timesCount}</Tag>  <br />
          计划开始时间：<Tag color="green">{newData.planStartDate}</Tag>
          计划结束时间：<Tag color="green">{newData.planEndDate}</Tag>
          计划共用时：<Tag color="green">{newData.planTotalTimes}小时</Tag> <br />
          实际开始时间：<Tag color="yellow">{newData.startDate}</Tag>
          实际结束时间：<Tag color="yellow">{newData.completeDate}</Tag>
          实际共用时：<Tag color="yellow">{newData.doTotalTimes}</Tag>
        </span>
      );

      versionAlert = (
        <Alert
          description={description}
          type="info"
          showIcon />
      );
    } else if (newData && this.state.type === 'env') {
      let description = (
        <span>
          <strong>环境执行信息>  </strong>
          创建总轮数：<Tag color="blue">{newData.timesCount}</Tag>  <br />
          计划开始时间：<Tag color="green">{newData.planStartDate}</Tag>
          计划结束时间：<Tag color="green">{newData.planEndDate}</Tag>
          计划共用时：<Tag color="green">{newData.planTotalTimes}小时</Tag><br />
          实际开始时间：<Tag color="yellow">{newData.startDate}</Tag>
          实际结束时间：<Tag color="yellow">{newData.completeDate}</Tag>
          实际共用时：<Tag color="yellow">{newData.doTotalTimes}</Tag>
        </span>
      );

      versionAlert = (
        <Alert
          description={description}
          type="info"
          showIcon />
      );
    }
    if (timesData.planStartDate && timesData.planEndDate && this.state.type === 'times') {
      let description = (
        <span>
          <strong>轮数执行信息>  </strong>
          计划开始时间：<Tag color="green">{timesData.planStartDate}</Tag>
          计划结束时间：<Tag color="green">{timesData.planEndDate}</Tag>
          计划共用时：<Tag color="green">{timesData.planTotalTimes}小时</Tag>
        </span>
      );

      versionAlert = (
        <Alert
          description={description}
          type="info"
          showIcon />
      );
    }


    return (
      <div className="case-do-content" ref="doContent">
        <div className="case-do-side">
          <h2>
            项目列表
            <a className="icon" onClick={this.reloadTree}><Icon type={this.state.loadingIcon} /></a>
          </h2>
          <div className="case-do-side-tree">
            <ProjectVersionTimesTree isExpanded={false}
              onSelect={this.onSelect}
              expandedKeys={this.state.expandedKeys}
              onExpand={this.onExpandTree}>
            </ProjectVersionTimesTree>
          </div>
        </div>

        <div className="case-do-container">
          <h2>执行结果 - {selectModuleName}</h2>

          <div style={{ padding: 10 }}>
            <div style={showVersionNum}>
              <Tag color="blue">执行版本总数：{this.state.data.length}</Tag>
            </div>
            <div >
              {versionAlert}
            </div>
            <div style={{ minWidth: 1300, overflowX: 'visible' }}>
              <Table bordered columns={columns}
                rowKey={record => record._id}
                expandedRowKeys={this.state.defaultExpandedRowKeys}
                onExpand={this.onExpanded}
                loading={this.state.tableLoading}
                pagination={false}
                dataSource={this.state.data}
                />
            </div>
          </div>
        </div>
      </div>
    );
  }
})

export default CaseDoViewResult;
