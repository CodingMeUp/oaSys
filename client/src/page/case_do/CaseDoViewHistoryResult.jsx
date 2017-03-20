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
import { HistoryVersionTimeTree, OnProSelect } from './HistoryVersionTimeTree';
import API from '../API';
import UiCtrl from '../utils/UiCtrl';
/**
 * 用例执行结果查看页面
 */

const CaseDoViewHistoryResult = React.createClass({
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
      loadingIcon: 'reload',
      expandedKeys: [],
      env: null
    }
  },
  componentDidMount() {
    // this.doContent = ReactDOM.findDOMNode(this.refs.doContent);
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

        _this.setState({
          tableLoading: false,
          data: result.data.data,
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
          <CaseDoAllResult doResult={doResult} isHistory={true} projectId={row.projectId} version={row.version} env={row.env} times={row.times} userId={row.caseDoUser} />
        ),
        onOk() { },
      });
    }
  },
  renderTGS(o, row, index) {
    return (
      <Tooltip placement='bottom' title='查看明细'>
        <Tag color="green" className="detailSpanStyle"><a onClick={this.showDoResultDetail.bind(this, o, '通过', row) }>{o}</a></Tag>
      </Tooltip>
    );
  },
  renderBTGS(o, row, index) {
    return (
      <Tooltip placement='bottom' title='查看明细'>
        <Tag color="yellow" className="detailSpanStyle"><a onClick={this.showDoResultDetail.bind(this, o, '不通过', row) }>{o}</a></Tag>
      </Tooltip>
    );
  },
  renderZSS(o, row, index) {
    return (
      <Tooltip placement='bottom' title='查看明细'>
        <Tag color="red" className="detailSpanStyle"><a onClick={this.showDoResultDetail.bind(this, o, '阻塞', row) }>{o}</a></Tag>
      </Tooltip>
    );
  },
  renderYLS(o, row, index) {
    return (
      <Tooltip placement='bottom' title='查看明细'>
        <Tag className="detailSpanStyle"><a onClick={this.showDoResultDetail.bind(this, o, null, row) }>{o}</a></Tag>
      </Tooltip>
    );
  },
  render() {
    const {selectModuleName} = this.state;
    const _this = this;

    let columns = [{
      title: '版本',
      dataIndex: 'version'
    }, {
        title: '轮数',
        width: 70,
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

    if (this.state.type === 'times') {
      columns.splice(2, 0, {
        title: '执行人',
        className: "tdAlignCenter",
        dataIndex: 'caseDoUsername'
      });
      columns.splice(columns.length, 0, {
        width:160,
        title: '开始时间',
        className: "tdAlignCenter",
        dataIndex: 'createDate'
      });
      columns.splice(columns.length, 0, {
        width:160,
        title: '结束时间',
        className: "tdAlignCenter",
        dataIndex: 'endDate'
      });
      
    }
    if (this.state.env) {
      columns.splice(2, 0, {
        title: '环境',
        className: "tdAlignCenter",
        dataIndex: 'env'
      });
    }

    const showVersionNum = this.state.type === 'project' ? { display: '' } : { display: 'none' };

    return (
      <div className="case-do-content" ref="doContent">
        <div className="case-do-side">
          <h2>
            历史项目列表
            <a className="icon" onClick={this.reloadTree}><Icon type={this.state.loadingIcon}/></a>
          </h2>
          <div className="case-do-side-tree">
            <HistoryVersionTimeTree isExpanded={false}
              onSelect={this.onSelect}
              expandedKeys={this.state.expandedKeys}
              onExpand={this.onExpandTree}>
            </HistoryVersionTimeTree>
          </div>
        </div>

        <div className="case-do-container">
          <h2>执行结果 - {selectModuleName}</h2>

          <div style={{ padding: 10 }}>
            <div style={showVersionNum}>
              <Tag color="blue">执行版本总数：{this.state.data.length}</Tag>
            </div>
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
    );
  }
})

export default CaseDoViewHistoryResult;
