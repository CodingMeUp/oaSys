import './style.less';
import React from 'react';
import { Input, Select, Col, Table, Button, Icon, Alert, Tag, message, Modal, Popover, Tooltip, Dropdown, Menu, notification } from 'antd'
import moment from 'moment';
import Ajax from '../../framework/common/ajax';
import PubSubMsg from '../../framework/common/pubsubmsg';
import CaseDoProjectTree from './CaseDoProjectTree';
import CaseDoHistorySelect from './CaseDoHistorySelect';
import { CaseDoResultColumns } from './CaseDoResult';
import * as _ from 'lodash';
import API from '../API';
import FAIcon from '../../framework/faicon/FAIcon';
import UiCtrl from '../utils/UiCtrl';
import CaseDoAllResult from './CaseDoAllResult';
import BugCreateWin from '../bug/win/BugCreateWin';
import Storage from '../../framework/common/storage';
import Funs from '../../framework/common/functions';
const Option = Select.Option;
const InputGroup = Input.Group;
const confirm = Modal.confirm;
const top_current_project = Funs.top_current_project +'_'+_USERINFO.userId;
var filterUserName = [];
var filterModuleNames = [];

const CaseDoTodoList = React.createClass({
  getInitialState() {
    return {
      loading: '',
      selectedRowKeys: [],
      data: [],
      caseInfo: {},
      moduleId: '',
      caseHistory: [],
      pagination: {
        pageSize: 500
      },
      selectModuleName: '',
      isShowCaseInfo: false,
      btnLoading: false,
      isCanSave: true,
      tableLoading: false,
      popVisible: false,
      loadingIcon: 'reload',
      filteredInfo: null,
      bugModalVisable: false,
      containerLeft: 205,
      sideBarDisplay: '',
    }
  },
  /**
   * 获取 带执行用例列表
   * moduleId：模块ID
   * moduleName：模块名称 用于显示在 标题上
   */
  fetch(moduleId, moduleName = null,ztModule = null, onlyShowHistory = 0, version = null, times = null, env = null) {

    let _this = this;
    let option = {
      moduleId: moduleId,
      ztModule:ztModule,
      type:Storage.local.get(top_current_project) ? Storage.local.get(top_current_project).type : null,
      onlyShowHistory: onlyShowHistory
    };
    if (version && times) {
      option.version = version;
      option.times = times;
      option.env = env;
    }

    Ajax.get({
      url: API.CASE_DO_TODO_LIST,
      data: option,
      before() {
        _this.setState({
          tableLoading: true
        });
      },
      success(res) {
        const result = res.body;
        if (result.status === 200 && result.data.caseDo) {
          filterUserName = [];
          if (result.data.caseDo && result.data.caseDo.usernames) {
            for (let i = 0; i < result.data.caseDo.usernames.length; i++) {
              filterUserName.push({
                text: result.data.caseDo.usernames[i],
                value: result.data.caseDo.usernames[i]
              })
            }
          }
          if (result.data.caseDo && result.data.caseDo.caseInfo) {
            const pagination = _this.state.pagination;
            pagination.total = result.data.caseDo.caseInfo.length;
            filterModuleNames = [];
            var myArr = []
            for (let i = 0; i < result.data.caseDo.caseInfo.length; i++) {

              if (myArr.indexOf(result.data.caseDo.caseInfo[i].childModuleName) < 0) {
                myArr.push(result.data.caseDo.caseInfo[i].childModuleName);
                filterModuleNames.push({
                  text: result.data.caseDo.caseInfo[i].childModuleName,
                  value: result.data.caseDo.caseInfo[i].childModuleName
                })

              }

            }
          }
          let isCanSave = result.data.caseDo ? !result.data.caseDo.isComplete : false;
          if (version && times) {
            isCanSave = result.data.caseDo ? !result.data.caseDo.isAllComplete : false;
          }
          _this.showChildModuleName = result.data.caseDo.isShowModule;

          let state = {
            tableLoading: false,
            data: onlyShowHistory ? [] : (result.data.caseDo ? result.data.caseDo.caseInfo : []),
            moduleId: moduleId,
            caseInfo: result.data.caseDo ? result.data.caseDo : {},
            caseHistory: result.data.doHistory,
            isCanSave: isCanSave,
            isShowCaseInfo: !onlyShowHistory,
            selectedRowKeys: []
          };
          let showCaseTestResultRemark = false;
          // console.log( state.data);
          state.data.forEach(item => {
            if (item.caseTestResult === '不通过' || item.caseTestResult === '阻塞') {
              showCaseTestResultRemark = true;
            }
          });
          _this.showCaseTestResultRemark = showCaseTestResultRemark;
          if (moduleName) {
            state.selectModuleName = moduleName;
          }
          _this.selectCaseDoId = result.data.caseDo ? result.data.caseDo._id : null;
          _this.setState(state);
        } else {
          message.info("选择的版本/轮数没有你的执行任务哦", 3);
          _this.setState({
            tableLoading: false
          });
        }
      }
    })
  },
  componentDidUpdate() {

  },
  componentWillUnmount() {
    PubSubMsg.unsubscribe('get_current_project');

  },
  componentDidMount() {

    const _this = this;
    PubSubMsg.subscribe('get_current_project', function (resData) {
      //顶部产品、项目变化时，中间及右侧用例执行页面显示为空
      _this.setState({
          tableLoading: false,
          data: [],
          moduleId:[],
          caseInfo: {}
      })
    });
  },
  onSelectChange(selectedRowKeys) {
    this.setState({ selectedRowKeys });
  },
  /**
   * 树状列表点击事件
   */
  onTreeSelect(info, e, node, event) {
    const nodeData = e.node.props.nodeData;
    // console.log(nodeData);
    if (nodeData.rowType === 'module') {
      if (nodeData.dot) {

        this.fetch(nodeData.moduleId, nodeData.moduleName);
      } else {
        this.fetch(nodeData.moduleId, nodeData.moduleName, null,1);
      }
      this.setState({
        filteredInfo: null
      })

      UiCtrl.scrollToTop();
    } else {
      PubSubMsg.publish('refresh-tree-data-expanded-keys', { id: nodeData._id });
    }
  },
  setCaseDoResult(row, e) {
    // row.caseTestResult = e;
    const data = [...this.state.data];
    let showCaseTestResultRemark = false;
    data.forEach(item => {
      if (item._id === row._id) {
        item.caseTestResult = e;
        item.caseDoResultChange = true;
      }
      if (item.caseTestResult === '不通过' || item.caseTestResult === '阻塞') {
        showCaseTestResultRemark = true;
      }
    });
    this.showCaseTestResultRemark = showCaseTestResultRemark;
    this.setState({ data });
  },
  /**
   * 渲染 表格用例设置测试结果栏
   */
  renderTestResult(o, row, index) {
    if (row.caseDoUser === window._USERINFO.userId) {
      return (
        <div id="area">
          <Select value={o} style={{ width: 80 }} onChange={this.setCaseDoResult.bind(this, row) } getPopupContainer={() => document.getElementById('area') }>
            <Option value="通过"><span style={{ color: 'green' }}>通过</span></Option>
            <Option value="不通过"><span style={{ color: 'gray' }}>不通过</span></Option>
            <Option value="阻塞"><span style={{ color: 'red' }}>阻塞</span></Option>
          </Select>
        </div>
      );
    } else {
      return (<span>{o}</span>);
    }
  },
  /**
   * 保存用例执行结果，把当前表格的所有数据json格式
   */
  handleSaveDoCaseResult() {
    if (this.state.data.length > 0 && this.state.caseInfo._id) {
      let isComplete = true; // 判断用例是否都设置了执行结果，来判断用例是否执行完毕。
      this.state.data.forEach(item => {
        if (!item.caseTestResult) {
          isComplete = false;
        }
      })
      const _this = this;
      // console.log(_this.state.data);
      Ajax.post({
        url: API.CASE_DO_UPDATE_RESULT,
        data: {
          data: _this.state.data,
          _id: _this.state.caseInfo._id,
          caseInfo:_this.state.caseInfo,
          type:Storage.local.get(top_current_project) ? Storage.local.get(top_current_project).type : null,
          isComplete: isComplete
        },
        before() {
          _this.setState({
            btnLoading: true
          });
        },
        success(res) {
          if (res.statusCode === 200) {
            const body = res.body;
            if (body.status === 200) {
              _this.setState({
                btnLoading: false
              })

              message.success('已保存成功');

              if (body.data.undoCnt > 0) {
                let msg = '还有【' + body.data.undoCnt + '】条用例未执行';
                const pagination = _this.state.pagination;
                if (pagination.total > pagination.pageSize) {
                  msg += '，当前存在分页 * 注意分页数据的执行情况';
                }
                notification['warning']({
                  message: '信息提示',
                  description: msg
                });
              }

              if (isComplete) {
                //给三处插开始时间数据
                var ajaxGet = {};
             
                
                
                ajaxGet.version = _this.state.caseInfo.version;
                ajaxGet.type = Storage.local.get(top_current_project) ? Storage.local.get(top_current_project).type : null;
                  //修改没有写入结束时间bug
                if( ajaxGet.type=="product"){
                  ajaxGet.projectId = _this.state.caseInfo.ztModule;

                }else{
                  ajaxGet.projectId = _this.state.caseInfo.project;  
                }
 
                Ajax.get({
                  url: API.GET_QAM_TIMES,
                  data: ajaxGet,
                  success: (result) => {
                    if (result.body.status != 500) {
                      if (!result.body.message) { //若有message消息代表当前项目未关联pms
                        console.log('结束时间 返回qam taskId' + result.body.data.taskId);
                        var updateBody = {};
                        updateBody.id = null,
                          updateBody.taskId = +result.body.data.taskId,//taskId
                          updateBody.round = +_this.state.caseInfo.times, //轮数
                          updateBody.startTime = moment(_this.state.caseInfo.createDate).format('YYYY/MM/DD'), //开始时间
                          updateBody.endTime = moment().format('YYYY/MM/DD'), //结束时间
                          updateBody.isAPI = 0, //都为0
                          updateBody.isPerformance = 0,//都为0
                          updateBody.isSecurity = 0,//都为0
                          updateBody.isStability = 0,//都为0
                          updateBody.isFitness = 0,//都为0
                          updateBody.riskEstimateSummary = null//默认空
                        if (updateBody.taskId != 0 && updateBody.round && updateBody.round != 0) {
                          Ajax.post({
                            url: API.UPDATE_QAM_TIMES,
                            data: updateBody,
                            success: (result) => {
                              console.log('qam  执行插入结束时间成功');
                            }
                          });
                        }
                      }
                    }

                  }
                });
                PubSubMsg.publish('refresh-todo-tree-data', {});
              }

            }
          }
        }
      })
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
    PubSubMsg.publish('refresh-todo-tree-data', {});
  },
  handlePopVisibleChange(visible) {
    this.setState({ popVisible: visible });
  },
  mulitSetMulitCaseDoResult(e) {
    const data = [...this.state.data];
    let showCaseTestResultRemark = false;
    data.forEach(item => {
      this.state.selectedRowKeys.forEach(key => {
        if (item._id === key) {
          item.caseTestResult = e.key;
          item.caseDoResultChange = true;
        }
      })
      if (item.caseTestResult === '不通过' || item.caseTestResult === '阻塞') {
        showCaseTestResultRemark = true;
      }
    });
    this.setState({selectedRowKeys: []});
    this.showCaseTestResultRemark = showCaseTestResultRemark;
    this.setState({ data });
    this.setState({ popVisible: visible });

  },
  menuClick(e) {
    const nodeData = e.item.props.value;
    if (e.item.props.attrClick) {
      this.fetch(nodeData.module, null,nodeData.ztModule, 0, nodeData.version, nodeData.times, nodeData.env);
    }
  },
  bugIdInputChange(e) {
    this.bugIdInputValue = e.target.value;
  },
  bugFromSelectChange(e) {
    this.bugFromSelectValue = e;
  },
  onBugWinCancel() {
    this.setState({
      bugModalVisable: false
    });
  },
  onBugWinOk(createBugInfo) {
    // console.log('createBugInfo: ', createBugInfo);
    if (this.currentSetBugRow) {
      let row = this.currentSetBugRow;
      let bugInfo = {
        bugId: createBugInfo.id,
        bugTitle: createBugInfo.title,
        bugSeverity: createBugInfo.severity,
        bugFrom: 'SDP'
      };
      row.bugInfo.push(bugInfo);
      //写如bug信息数据，直接调用新字段，旧字段不做处理
     	// row.bugId = createBugInfo.id;
      // row.bugTitle = createBugInfo.title;
   	  // row.bugSeverity = createBugInfo.severity;
     	// row.bugFrom = 'SDP';
      row.caseDoResultChange = true;

      let data = this.state.data || [];
      for (let i = 0; i < data.length; i++) {
        if (data[i]._id === row._id) {
          data[i] = row;
        }
      }
      this.setState({
        data: data,
        bugModalVisable: false
      });
    } else {
      this.setState({
        bugModalVisable: false
      });
    }
  },
  openNewBugOpreate(row) {
    this.currentSetBugRow = row;
    this.setState({
      bugModalVisable: true
    });
  },
  openBugOpreate(row) {
    const rowId = row._id;
    const _this = this;
    _this.bugFromSelectValue = row.bugFrom;
    const content = (
      <div>
        <InputGroup size="large">
          <Input  placeholder="输入BUG ID" onChange={this.bugIdInputChange} />
          <div className="ant-input-group-wrap">
            <Select defaultValue={row.bugFrom ? row.bugFrom : 'SDP'} onChange={this.bugFromSelectChange} style={{ width: 130 }}>
              <Option value="SDP">SDP BUG平台</Option>
              <Option value="HUAYU">HUAYU BUG平台</Option>
            </Select>
          </div>
        </InputGroup>
      </div>
    );
    Modal.confirm({
      title: 'BUG ID 关联',
      content: content,
      onOk() {
        Ajax.get({
          url: API.BUG_GET_BY_ID,
          data: {
            bugId: _this.bugIdInputValue,
            from: _this.bugFromSelectValue ? _this.bugFromSelectValue : 'SDP'
          },
          success(res) {
            const result = res.body;
            //add by qiang 2016/09/19 for 单条用例可以绑定多个bug
            if (!_.isEmpty(result.data)) {

              let bugInfo = {
                bugId: _this.bugIdInputValue,
                bugTitle: result.data.title,
                bugSeverity: result.data.severity,
                bugFrom: _this.bugFromSelectValue ? _this.bugFromSelectValue : 'SDP'
              };
              row.bugInfo.push(bugInfo);
              //写如bug信息数据，直接调用新字段，旧字段不做处理
              // if (!row.bugId) {
              //   row.bugId = _this.bugIdInputValue;
              //   row.bugTitle = result.data.title;
              //   row.bugSeverity = result.data.severity;
              //   row.bugFrom = _this.bugFromSelectValue ? _this.bugFromSelectValue : 'SDP';
              // }
              row.caseDoResultChange = true;
              let data = _this.state.data || [];
              for (let i = 0; i < data.length; i++) {
                if (data[i]._id === row._id) {
                  data[i] = row;
                }
              }
              _this.setState({
                data: data
              });
            } else {
              message.error('没有找到ID为：' + _this.bugIdInputValue + '的BUG信息');
            }
          }
        })
      },
      onCancel() { }
    });
  },
  onBugTagClose(row) {
    row.bugFrom = undefined;
    row.bugId = undefined;
    row.bugSeverity = undefined;
    row.bugTitle = undefined;
    row.caseDoResultChange = true;
    let data = this.state.data || [];
    for (let i = 0; i < data.length; i++) {
      if (data[i]._id === row._id) {
        data[i] = row;
      }
    }
    this.setState({
      data: data
    });
  },
  onBugTagCloseNew(row, bugId) {
    for (let j = 0; j < row.bugInfo.length; j++) {
      if (row.bugInfo[j].bugId == bugId) {
        row.bugInfo[j].bugFrom = undefined;
        row.bugInfo[j].bugId = undefined;
        row.bugInfo[j].bugSeverity = undefined;
        row.bugInfo[j].bugTitle = undefined;
        row.caseDoResultChange = true;
      }
    }
    let data = this.state.data || [];
    for (let i = 0; i < data.length; i++) {
      if (data[i]._id === row._id) {
        data[i] = row;
      }
    }
    this.setState({
      data: data
    });
  },

  handleChange(pagination, filters, sorter) {
    this.setState({
      filteredInfo: filters
    });
  },
  renderBug(o, row, index) {
    const loop = data => data.map((item) => {
      const bugInfo = CaseDoResultColumns.renderBugInfo(item);
      const bugUrl = bugInfo.bugUrl;
      const bugSeverityStr = bugInfo.bugSeverityStr;
      if (item.bugId) {
        return (
          <p>
            <Tooltip placement="right" title={(<span>严重程度：{bugSeverityStr}<br/>标题：{item.bugTitle}</span>) }>
              <Tag closable onClose={this.onBugTagCloseNew.bind(this, row, item.bugId) }><a href={bugUrl} target="_blank"><strong>ID: {item.bugId}</strong></a></Tag>
            </Tooltip>
          </p>
        )
      }
      return;
    });

    if (o) {
      const bugInfo = CaseDoResultColumns.renderBugInfo(row);
      const bugUrl = bugInfo.bugUrl;
      const bugSeverityStr = bugInfo.bugSeverityStr;
      let bugTitle = row.bugTitle;

      let bugTitleShort = '';
      bugTitleShort = bugTitle.length >= 35 ? bugTitle.substring(0, 35) + '.....' : bugTitle;
      return (
        <div>
          <p>
            <Tooltip placement="right" title={(<span>严重程度：{bugSeverityStr}<br/>标题：{bugTitle}</span>) }>
              <Tag closable onClose={this.onBugTagClose.bind(this, row) }><a href={bugUrl} target="_blank"><strong>ID: {o}</strong></a></Tag>
            </Tooltip>
          </p>
        </div>
      )
    }
    return (
      <div>
        {loop(row.bugInfo) }
        <a title="关联已有的BUG ID" onClick={this.openBugOpreate.bind(this, row) }><Icon type="link" /> 关联BUG</a>
        <br />
        <a title="打开窗口新增BUG，并自动关联" onClick={this.openNewBugOpreate.bind(this, row) }><Icon type="plus-square" /> 新增BUG</a>
      </div>
    )
  },
  testResultRemarkChange(row, e) {
    // console.log(e.target.value);
    const data = [...this.state.data];
    data.forEach(item => {
      if (item._id === row._id) {
        item.caseTestResultRemark = e.target.value;
        item.caseDoResultChange = true;
      }
    });
    // this.setState({ data });
  },
  renderTestResultRemark(o, row, index) {
    if (o || row.caseTestResult === '不通过' || row.caseTestResult === '阻塞') {
      const key = "textarea_" + index;
      return (
        <div>
          <Input key={key} type="textarea" defaultValue={o} onChange={this.testResultRemarkChange.bind(this, row) } rows={3} />
        </div>
      );
    }
  },
  testResultHistory(row) {
    Modal.info({
      title: '用例执行结果',
      width: '96%',
      content: (
        <CaseDoAllResult caseId={row._id} fetchByCaseId={true} />
      ),
      onOk() { },
    });
  },
  renderResultHistory(o, row, index) {
    return (<Tooltip title="结果" placement="left"><a onClick={this.testResultHistory.bind(this, row) }><Icon type="book" /></a></Tooltip>);
  },
  hideSideTree() {
    this.setState({
      sideBarDisplay: 'none',
      containerLeft: 0
    });
  },
  showSideTree() {
    this.setState({
      sideBarDisplay: '',
      containerLeft: 205
    });
  },
  render() {
    let {filteredInfo} = this.state;
    filteredInfo = filteredInfo || {};
    let columns = [
      {
      title: '序号',
      width: 45,
      className: "tdAlignCenter",
      dataIndex: 'rowSort',
      render: function (o, row, index) {
          return (<span>{o}</span>);
        },
    },
      {
      title: '测试结果',
      width: 100,
      dataIndex: 'caseTestResult',
      render: this.renderTestResult
    }, {
        title: '执行人',
        dataIndex: 'caseDoUser',
        className: "tdAlignCenter",
        width: 100,
        render: function (o, row, index) {
          return (<span>{row.caseDoUsername}</span>);
        },
        filters: filterUserName,
        onFilter: (value, record) => record.caseDoUsername === value
      }, {
        title: '关联BUG',
        className: "tdBugId",
        dataIndex: 'bugId',
        width: 135,
        render: this.renderBug
      },
    ];
    let tableColums = CaseDoResultColumns.getColumns();
    //this.showChildModuleName = false;
    if (this.showChildModuleName) {
      tableColums.splice(0, 0, {
        title: '模块',
        width: 100,
        dataIndex: 'childModuleName',
        render: function (o, row, index) {
          return (<span>{row.childModuleName}</span>);
        },
        filters: filterModuleNames,
        filteredValue: filteredInfo.childModuleName,
        onFilter: (value, record) => record.childModuleName === value
      });
    }

    columns = columns.concat(tableColums);
    if (this.showCaseTestResultRemark) {
      columns.splice(2, 0, {
        title: '实际情况',
        width: 120,
        dataIndex: 'caseTestResultRemark',
        render: this.renderTestResultRemark
      });
    }
    columns.push({
      title: '操作',
      width: 50,
      className: "tdAlignCenter",
      render: this.renderResultHistory
    });

    const { selectedRowKeys, tableLoading, selectModuleName, isShowCaseInfo, caseInfo, isCanSave, btnLoading, moduleId } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
      getCheckboxProps(record) {
        return {
          disabled: record.caseDoUser !== window._USERINFO.userId
        }
      }
    };
    const hasSelected = selectedRowKeys.length > 0;
    const caseInfoStyle = isShowCaseInfo ? { display: '' } : { display: 'none' };
    const caseDoStatus = caseInfo.isComplete ?
      (<Tag color="red">已完成（{moment(caseInfo.completeDate).format('YYYY-MM-DD HH:mm:ss') }）</Tag>) :
      (<Tag color="red">执行中</Tag>);
    const description = (
      <span>
        <strong>执行用例基本信息>  </strong>
        执行版本：<Tag color="blue">{caseInfo.version}</Tag>
        执行轮数：<Tag color="blue">{caseInfo.times}</Tag>
        任务分配人：<Tag color="green">{caseInfo.createUsername}({caseInfo.createUser}) </Tag>
        分配时间：<Tag color="yellow">{moment(caseInfo.createDate).format('YYYY-MM-DD HH:mm:ss') }</Tag>
        执行状态：{caseDoStatus}
      </span>
    );
    const btnSaveText = btnLoading ? "正在保存..." : "保存执行结果";
    const caseDoHistoryDisplay = this.state.caseHistory.length > 0 ? { display: '' } : { display: 'none' };
    const menuDoResult = (
      <Menu onClick={this.mulitSetMulitCaseDoResult} >
        <Menu.Item key='通过'><span style={{ color: 'green' }}>通过</span></Menu.Item>
        <Menu.Item key='不通过'><span style={{ color: 'gray' }}>不通过</span></Menu.Item>
        <Menu.Item key='阻塞'><span style={{ color: 'red' }}>阻塞</span></Menu.Item>
      </Menu>
    );
    const popoverContent = (
      <div>
        <Dropdown overlay={menuDoResult}>
          <strong className="ant-dropdown-link">
            <a>选择要批量设置的执行结果 <Icon type="down" /></a>
          </strong>
        </Dropdown>
      </div>
    );
    const menuItem = this.state.caseHistory.map((item, index) => {

      var type = Storage.local.get(top_current_project) ? Storage.local.get(top_current_project).type : null;
      let strArr =[]
      if(type && type=="product"){
        strArr.push('子项目：' + item.ztModuleName);
        strArr.push('版本：' + item.version);
        if (item.env) {
          strArr.push('环境：' + item.env);
        }
        strArr.push('轮数：（' + item.times + '）');
      }else{
        strArr.push ('版本：' + item.version);
        if (item.env) {
          strArr.push('环境：' + item.env);
        }
        strArr.push('轮数：（' + item.times + '）');

      }

      let str = (<a>{strArr.join('，') }</a>);

      let attrClick = true;
      if (this.selectCaseDoId === item._id) {
        str = (<a><strong>{strArr.join('，') }</strong></a>);
        attrClick = false;
      }
      return (
        <Menu.Item key={item._id} value={item} attrClick={attrClick}>
          {str}
        </Menu.Item>
      );
    });
    const menu = (
      <Menu style={{ overflow: 'auto', maxHeight: 300 }} onClick={this.menuClick}>
        {menuItem}
      </Menu>
    );
    const dropdownMenuDisplay = { 'display': (this.state.caseHistory.length > 0 ? '' : 'none'), paddingLeft: 10 };

    const sidebarStyle = {
      display: this.state.sideBarDisplay
    };
    const containerStyle = {
      marginLeft: this.state.containerLeft
    };
    const showTreeIconStyle = {
      display: this.state.sideBarDisplay == '' ? 'none' : ''
    };
    return (
      <div className="case-do-content"  >
        <div className="case-do-side" style={sidebarStyle}>
          <h2>
            待执行项目列表
            <Tooltip placement="right" title="收起左边栏">
              <a className="icon" onClick={this.hideSideTree}><FAIcon type="fa-chevron-left"/></a>
            </Tooltip>

            <Tooltip title="刷新" placement="bottom"><a style ={{ marginRight: 10 }} className="icon" onClick={this.reloadTree}><Icon type={this.state.loadingIcon}/></a></Tooltip>
          </h2>
          <div className="case-do-side-tree">
            {/*<ProjectTree apiUrl={API.MODULE_TREE_WITH_CASE_DO_DOT} onSelect={this.onTreeSelect} openDotNode={true} />*/}
            {/*<CaseDoProjectTree  apiUrl={API.MODULE_TREE_WITH_CASE_DO_DOTS} onSelect={this.onTreeSelect} openDotNode={true} />*/}
            <CaseDoProjectTree  apiUrl={API.MODULE_TREE_WITH_CASE_DO_DOTS} onSelect={this.onTreeSelect} openDotNode={true} />
          </div>
        </div>

        <div className="case-do-container" style={containerStyle}>
          <h2>
            <Tooltip placement="right" title="显示左边栏">
              <a className="icon" onClick={this.showSideTree} style={showTreeIconStyle}><FAIcon type="fa-chevron-right"/></a>
            </Tooltip>
            待执行用例列表 - {selectModuleName}
          </h2>
          <div className="case-do-btn-save"  id="area">
            <span className="rightOpt" style={caseDoHistoryDisplay}>
              <CaseDoHistorySelect menuData={this.state.caseHistory} moduleId={this.state.moduleId} />
            </span>
            <Button type="primary" loading={this.state.btnLoading} disabled={!isCanSave} onClick={this.handleSaveDoCaseResult}><Icon type="save" /> {btnSaveText}</Button>
            <Popover content={popoverContent} title="设置执行结果" trigger="click" placement="bottomLeft"
              visible={this.state.popVisible} onVisibleChange={this.handlePopVisibleChange}
              getPopupContainer={() => document.getElementById('area') }>
              <Button style={{ marginLeft: 10 }} type="ghost" disabled={!hasSelected}>批量设置</Button>
            </Popover>
            <span style={dropdownMenuDisplay}>
              <Dropdown overlay={menu}>
                <a className="ant-dropdown-link">
                  选择要执行的版本/轮数 <Icon type="down" />
                </a>
              </Dropdown>
            </span>
          </div>
          <div style={{ paddingTop: 40 }}></div>
          <div className="case-do-toolbar">
            <fieldset className="case-do-case-info" style={caseInfoStyle}>
              <Alert
                description={description}
                type="info"
                showIcon />
            </fieldset>
          </div>

          <div style={{ minWidth: 1500, overflowX: 'visible' }}>
            <Table bordered columns={columns}
              rowKey={record => record._id}
              rowSelection={rowSelection}
              loading={tableLoading}
              pagination={this.state.pagination}
              dataSource={this.state.data}
              onChange={this.handleChange}
              scroll={{ y: 500 }}/>
          </div>
        </div>

        <BugCreateWin visible={this.state.bugModalVisable} onCancel={this.onBugWinCancel} onOk={this.onBugWinOk} />
      </div>
    );
  }
})

export default CaseDoTodoList;
