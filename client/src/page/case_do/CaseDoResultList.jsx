import './style.less';
import React from 'react';
import ReactDOM from 'react-dom';
import {Breadcrumb, Alert, Icon, Spin, Table, Tag, Modal, Tooltip, Progress } from 'antd'
import moment from 'moment';
import Page from '../../framework/page/Page';
import Ajax from '../../framework/common/ajax';
import PubSubMsg from '../../framework/common/pubsubmsg';
import ProjectTree from '../case/ProjectTree';
import CaseDoResult from './CaseDoResult';
import CaseDoAllResult from './CaseDoAllResult';
import { ProjectVersionTimesTree, OnProSelect } from './ProjectVersionTimesTree';
import API from '../API';
import UiCtrl from '../utils/UiCtrl';
/**
 * 查询执行结果页面 ，提供门户使用
 */

const CaseDoResultList = React.createClass({
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
    // this.ztProductId = this.props.location.query.ztProductId;
    this.projectId = this.props.location.query.ztModuleId;
    this.moduleId = this.props.location.query.moduleId;
    this.version = this.props.location.query.version;
    this.env = this.props.location.query.env;
    this.times = this.props.location.query.times;
    if (this.projectId) {
      this.fetchDatas(this.projectId, this.moduleId, this.version, this.env, this.times);
    }
    this.ztProductId = this.props.location.query.ztProductId;
    if(this.ztProductId){
      const ztProductId = this.ztProductId;
      PubSubMsg.publish('get_product', {
          ztProductId
      });
    }

  },
  fetchDatas(projectId, moduleId, version, env, times) {
    let data = {
      projectId: projectId,
      type: 'project',
      proType: 'product'
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
          type: data.type,
          env: result.data.hasEnv,
          expandedKeys: [..._this.state.expandedKeys]
        })
      }
    })
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
    console.log(doResult);
     console.log("doResult");
      console.log(row);
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
        <Tag color="green"><a onClick={this.showDoResultDetail.bind(this, o, '通过', row) }>{o}</a></Tag>
      </Tooltip>
    );
  },
  renderBTGS(o, row, index) {
    return (
      <Tooltip placement='bottom' title='查看明细'>
        <Tag color="yellow"><a onClick={this.showDoResultDetail.bind(this, o, '不通过', row) }>{o}</a></Tag>
      </Tooltip>
    );
  },
  renderZSS(o, row, index) {
    return (
      <Tooltip placement='bottom' title='查看明细'>
        <Tag color="red"><a onClick={this.showDoResultDetail.bind(this, o, '阻塞', row) }>{o}</a></Tag>
      </Tooltip>
    );
  },
  renderYLS(o, row, index) {
    return (
      <Tooltip placement='bottom' title='查看明细'>
        <Tag color="green"><a onClick={this.showDoResultDetail.bind(this, o, null, row) }>{o}</a></Tag>
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
        width: 90,
        className: "tdAlignCenter",
        dataIndex: 'times'
      }, {
        title: '进度',
        className: "tdAlignCenter",
        render: function (o, row, index) {
          const percentNum = parseInt(row.doNumber / row.caseNumber * 100);
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
    }
    if (this.state.env) {
      columns.splice(2, 0, {
        title: '环境',
        className: "tdAlignCenter",
        dataIndex: 'env'
      });
    }

    const showVersionNum = this.state.type === 'project' ? { display: '' } : { display: 'none' };
    const pageHeader =
      <div>
        <h1 className="admin-page-header-title" ref="pageTitleH">执行结果</h1>
        <Breadcrumb>
          <Breadcrumb.Item>
            <Icon type="home" />
            首页
          </Breadcrumb.Item>
          <Breadcrumb.Item>用例管理</Breadcrumb.Item>
          <Breadcrumb.Item>执行结果</Breadcrumb.Item>
        </Breadcrumb>
      </div>
      ;
    return (

      <Page ref="pageTitle" header={pageHeader} loading={this.state.loading}>
        <div className="case-do-result-container">
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

      </Page>
    );
  }
})


export default CaseDoResultList;
