import './style.less';
import React from 'react';
import reqwest from 'reqwest';
import ReactDOM from 'react-dom';
import { Alert, Icon, Spin, Table, Tag, Modal, Tooltip, Progress } from 'antd'
import moment from 'moment';
import Ajax from '../../framework/common/ajax';
import PubSubMsg from '../../framework/common/pubsubmsg';
import SelfTestAllResult from './SelfTestAllResult';
import CaseDoProjectTree from '../case_do/CaseDoProjectTree';
import Storage from '../../framework/common/storage';
import Funs from '../../framework/common/functions';
import API from '../API';
/**
 * 自测执行结果查看页面
 */
const top_current_project = Funs.top_current_project + '_' + _USERINFO.userId;

const SelfTestViewResult = React.createClass({
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
      url: API.SELFTEST_VERSION_LIST,
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
  fetchData(type, selectName, projectId, moduleId, version, env, times) {
    let data = {};
    if (type == 'project') {
      data = {
        projectId: projectId,
        type: 'project'
      }
    } else if (type == 'childProject') {
      data = {
        projectId: projectId,
        type: 'childProject'
      }
    } else if (type == 'module') {
      data = {
        projectId: projectId,
        moduleId: moduleId,
        type: 'module'
      }
    }
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
      url: API.SELFTEST_RESULT,
      data:data,
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
  onTreeSelect(info, e, node, event) {
    const nodeData = e.node.props.nodeData;    
    if (nodeData.children) {
      this.setState({
        moduleId: '',
        selectModuleName: nodeData.moduleName
      })
    } else {
      this.setState({
        moduleId: nodeData.moduleId,
        selectModuleName: nodeData.moduleName
      })
    }

    if (nodeData.rowType === 'project') {
      this.fetchData('project', nodeData.projectName, nodeData._id);
    } else if (nodeData.rowType === 'childProject') {
      this.fetchData('childProject', nodeData.projectName, nodeData._id);
    } else if (nodeData.rowType === 'module') {
      this.fetchData('module', nodeData.moduleName, nodeData.projectId, nodeData.moduleId);
    }
    // else if (nodeData.rowType === 'version') {
    //   this.fetchData(nodeData.moduleName, nodeData.projectId, nodeData.version);
    // } else if (nodeData.rowType === 'env') {
    //   this.fetchData(nodeData.moduleName, nodeData.projectId, nodeData.version, nodeData.env);
    // } else if (nodeData.rowType === 'times') {
    //   this.fetchData(nodeData.moduleName, nodeData.projectId, nodeData.version, nodeData.env, nodeData.times);
    // } 
    if (nodeData.rowType !== 'times') {
      let expandedKeys = [...this.state.expandedKeys];
      let index = expandedKeys.indexOf(nodeData._id);

      if (index > -1) {
        expandedKeys.splice(index, 1);
      } else {
        expandedKeys.push(nodeData._id);
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
          <SelfTestAllResult doResult={doResult} projectId={row.projectId} moduleId={row.moduleId} version={row.version} env={row.env} times={row.times} userId={row.caseDoUser} />
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
    const {selectModuleName} = this.state;
    const _this = this;

    let columns = [
      {
        title: '版本',
        dataIndex: 'version'
      }, {
        title: '轮数',
        width: 50,
        className: "tdAlignCenter",
        dataIndex: 'times'
      }, {
        title: '进度',
        className: "tdAlignCenter",
        width: 80,
        render: function (o, row, index) {
          const percentNum = parseInt(row.doNumber / row.caseNumber * 100);
          return (
            <Progress type="circle" width={30} format={percent => percent} percent={percentNum} />
          );
        }
      }, {
        title: '执行人',
        className: "tdAlignCenter",
        width: 160,
        dataIndex: 'usernames'
      }, {
        title: '完成时间',
        className: "tdAlignCenter",
        width: 180,
        dataIndex: 'completeDate',
        render: function (o) {
          return moment(o).format('YYYY-MM-DD HH:mm:ss') == 'Invalid date' ? '' : moment(o).format('YYYY-MM-DD HH:mm:ss')
        }
      }, {
        title: '用例数',
        className: "tdAlignCenter",
        dataIndex: 'caseNumber',
        width: 100,
        render: this.renderYLS
      }, {
        title: '已执行数',
        className: "tdAlignCenter",
        width: 100,
        dataIndex: 'doNumber'
      }, {
        title: '通过数',
        className: "tdAlignCenter",
        dataIndex: 'passNumber',
        width: 100,
        render: this.renderTGS
      }, {
        title: '不通过数',
        className: "tdAlignCenter",
        dataIndex: 'unPassNumber',
        width: 100,
        render: this.renderBTGS
      }
      // {
      //   title: '阻塞数',
      //   className: "tdAlignCenter",
      //   dataIndex: 'blockNumber',
      //   render: this.renderZSS
      // }
    ];

    if (this.state.type == 'project' || this.state.type == 'childProject') {
      columns.splice(1, 0, {
        title: '所属模块',
        dataIndex: 'moduleName',
        width: 160,
        render: function (o, row, index) {
          return o;
        }
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
            项目列表
            <a className="icon" onClick={this.reloadTree}><Icon type={this.state.loadingIcon} /></a>
          </h2>
          <div className="case-do-side-tree">
            <CaseDoProjectTree apiUrl={API.MODULE_TREE}
              isExpanded={false}
              onSelect={this.onTreeSelect}
              expandedKeys={this.state.expandedKeys}
              onExpand={this.onExpandTree}
              openDotNode={true} />
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

export default SelfTestViewResult;
