import './style.less';
import React from 'react';
import { Slider,Input, Select, Col, Form,Table, Button, Icon, Alert, Tag, message, Modal, Popover, Tooltip, Dropdown, Menu, notification } from 'antd'
import moment from 'moment';
import Ajax from '../../framework/common/ajax';
import PubSubMsg from '../../framework/common/pubsubmsg';
import CaseDoProjectTree from '../case_do/CaseDoProjectTree';
import { SelfTestResultColumns } from './SelfTestResult';
import * as _ from 'lodash';
import API from '../API';
import UiCtrl from '../utils/UiCtrl';
const Option = Select.Option;
const InputGroup = Input.Group;
const confirm = Modal.confirm;
const FormItem = Form.Item;
const createForm = Form.create;
var filterUserName = [];
var filterModuleNames = [];
let CaseDoTodoList = React.createClass({
  getInitialState() {
    return {
      loading: '',
      selectedRowKeys: [],
      data: [],
      caseInfo: {},
      moduleId: '',
      caseHistory: [],
      pagination: {
        pageSize: 250
      },
      selectModuleName: '',
      isShowCaseInfo: false,
      btnLoading: false,
      beginTestBtn : false,
        isCanSave: true,
      saveTestBtn :true,
      tableLoading: false,
        popVisible: false,
      loadingIcon: 'reload',
      filteredInfo: null,
      bugModalVisable: false,
      confirmLoading: false,
      modalVisible: false,
      modalModleVisible: false,
      modalTitle: '新增版本/轮数',
      selectCaseDoId:'',
      selectTreeNodeData:{},
      currentInputVersion:'',
      currentInputTimes:0,
      baseInfoVisible:{'display':'none'},
      saveReturnCompleteDate:'',
      saveReturnComplete:false
    }
  },
  /**
   * 获取 带执行用例列表
   * moduleId：模块ID
   * moduleName：模块名称 用于显示在 标题上
   */
  fetch(moduleId, moduleName = null, onlyShowHistory = 0, version = null, times = null, env = null) {
    let _this = this;
    let option = {
      moduleId: moduleId,
      onlyShowHistory: onlyShowHistory
    };
    if (version && times) {
      option.version = version;
      option.times = times;
      option.env = env;
    }
    Ajax.get({
      url: API.SELFTEST_TODO_LIST,
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
            selectedRowKeys: [],
            caseInfo: result.data.caseDo ? result.data.caseDo : {},
            caseHistory: result.data.doHistory,
            selectCaseDoId: result.data.caseDo ? result.data.caseDo._id : null
          };
          if (moduleName) {
            state.selectModuleName = moduleName;
          }
          _this.setState(state);
        }else {
          if (moduleName) {
           _this.setState({
              selectModuleName:moduleName,
              caseHistory:[]
            });
          }
          message.info("您选择的模块还没有添加执行任务哦", 3);
          _this.setState({
            data:[],
            tableLoading: false
          });
        } 
      }
    })
  },
  componentDidUpdate() {

  },
  componentDidMount() {

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
        this.fetch(nodeData.moduleId, nodeData.moduleName, 1);
      }
      this.setState({
        filteredInfo: null,
        selectTreeNodeData:nodeData,
        currentInputVersion:'',
        currentInputTimes:0,
      })

      UiCtrl.scrollToTop();
    } else {
      PubSubMsg.publish('refresh-tree-data-expanded-keys', { id: nodeData._id });
    }
  },
  setCaseDoResult(row, e) {
    // row.caseTestResult = e;
    let textArea = e.target.value;
    const data = [...this.state.data];
    data.forEach(item => {
      if (item._id === row._id) {
        if(textArea.length > 0 ){
          item.caseTestResult = '不通过';
          item.caseTestResultRemark = textArea;
        }else{
          item.caseTestResult = '通过';
          item.caseTestResultRemark = '';
        }
        item.caseDoResultChange = true;
      }

    });
    this.setState({ data });
  },
  /**
   * 渲染 表格用例设置测试结果栏
   */
  renderTestResult(o, row, index) {
      const key = "textareaSelfTest_" + index;
      return (
         <Input type="textarea" key={key} rows={4} value={`${row.caseTestResultRemark}`} onChange={this.setCaseDoResult.bind(this, row) }/>
      );

  },
  /**
   * 保存用例执行结果，把当前表格的所有数据json格式
   */
  handleSaveDoCaseResult() {
     if (this.state.data.length > 0 && this.state.caseInfo._id) {
      let isComplete = true; // 判断用例是否都设置了执行结果，来判断用例是否执行完毕。
      this.state.data.forEach(item => {
        // if (!item.caseTestResult) {
        //   isComplete = false;
        // }

        // if(item.caseTestResult != '不通过' || item.caseTestResult == undefined)
        if(item.caseTestResult == '不通过'  && item.caseTestResultRemark){

        }else{
           item.caseTestResult = '通过';
           item.caseTestResultRemark = '';
        }

      })
      const _this = this;

      Ajax.post({
        url: API.SELFTEST_UPDATE_RESULT,
        data: {
          data: _this.state.data,
          _id: _this.state.caseInfo._id,
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
                btnLoading: false,
                saveReturnCompleteDate:body.data.completeDate,
                saveReturnComplete:body.data.isComplete,
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
                // PubSubMsg.publish('refresh-todo-tree-data', {});
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

  menuClick(e) {
    const nodeData = e.item.props.value;
    this.setState({
      currentInputVersion:nodeData.version,
      currentInputTimes:nodeData.times,
      saveReturnComplete:false,
      saveReturnCompleteDate:''
    });

    if (e.item.props.attrClick) {
      this.fetch(nodeData.module, null, 0, nodeData.version, nodeData.times, nodeData.env);
    }
  },
  handleChange(pagination, filters, sorter) {
    this.setState({
      filteredInfo: filters
    });
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
  handleAddVersionInfo() {
    this.props.form.setFieldsValue({
        dotimes:1
    });
 
    this.setState({
      modalVisible: true,
      sliderValue:1
    });
  },
  handleModuleCancel() {
    this.setState({
      modalVisible: false,
    })
  },
  handleModuleOk(){
    let timesInput = this.props.form.getFieldValue('dotimes');
    let versionInput = this.props.form.getFieldValue('doversion');
    let _this = this;
    _this.props.form.validateFields((errors, values) => {
      let canSave = true;
      if (errors) {
        if (!_.isEmpty(errors)) {
          canSave = false;
        }
      }

      if (!canSave) {
        return;
      } else {
 
        Ajax.post({
          url: API.MODULE_VERSION_SAVE,
          data: {
            version: _this.props.form.getFieldValue('doversion'),
            times: _this.props.form.getFieldValue('dotimes'),
            moduleId:_this.state.selectTreeNodeData.moduleId
          },
          success(res) {
            const result = res.body;
            if (result.status === 200) {
              message.info(result.message);
                _this.setState({
                  modalVisible: false,
                  baseInfoVisible:{'display':''}
              })
            } else {
              message.error(result.message);
              _this.setState({
                  modalVisible: false
              })
            }
          }
        })

        //casedsitrabution 批量 let moduleInfo = [];
        let moduleIds = [];
        moduleIds.push(_this.state.selectTreeNodeData.moduleId);
        let moduleNames = [];
        let moduleInfo = [];
        moduleInfo.push({
            moduleId:_this.state.selectTreeNodeData.moduleId,
            moduleName:_this.state.selectTreeNodeData.moduleName
        })
        moduleNames.push(moduleInfo);

         Ajax.post({
          url: API.SELFTEST_SAVE_BY_MULIT_MODULE,
          data: {
            version: _this.props.form.getFieldValue('doversion'),
            projectId: _this.state.selectTreeNodeData.projectId,
            times: _this.props.form.getFieldValue('dotimes'),
            moduleIds: moduleIds,
            moduleNames: moduleNames,//存入已勾选模块（包含子模块）id和名称
            userId: _USERINFO.userId,
            filterName: ['高']
          },
          before() {
            // _this.setState({
            //   confirmModuleLoading: true
            // })
          },
          success(res) {
            const result = res.body;
            if (result.status === 200) {
              if (result.data.length > 0) {
                const info = result.data.map((item) => {
                  return (<p>{item}</p>);
                });

                notification['warning']({
                  message: '信息提示',
                  description: info
                });
              } else {
                message.info(result.message);
                  _this.fetch(moduleIds[0],null,0,_this.props.form.getFieldValue('doversion'),_this.props.form.getFieldValue('dotimes'));
                  _this.setState({
                    currentInputVersion:_this.props.form.getFieldValue('doversion'),
                    currentInputTimes:_this.props.form.getFieldValue('dotimes'),
                    saveReturnComplete:false,
                    saveReturnCompleteDate:''
                  });
              }
            

              //fetch reload
              // _this.fetchProjectModuleData({
              //   projectId: _this.stateValue.currentSelectData.projectId,
              //   times: _this.stateValue.currentSelectData.times,
              //   version: _this.stateValue.currentSelectData.version,
              //   env: _this.stateValue.currentSelectData.env,
              //   projectName: _this.stateValue.currentSelectData.projectName,
              //   auditUsers: _this.stateValue.currentSelectData.auditUsers,
              //   users: _this.stateValue.currentSelectData.users
              // });
            } else {
              message.error(result.message);
            }
          }
        })

      }
    });

  },

  render() {
    let {filteredInfo} = this.state;
    filteredInfo = filteredInfo || {};
    let columns = [{
      title: '执行备注',
      width: 150,
      dataIndex: 'caseTestResult',
      render: this.renderTestResult
    }, 
    ];
    let tableColums = SelfTestResultColumns.getColumns();

    columns = columns.concat(tableColums);

    const { selectedRowKeys,currentInputTimes, tableLoading, selectModuleName, isShowCaseInfo, caseInfo, btnLoading, moduleId } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
      getCheckboxProps(record) {
        return {
          disabled: record.caseDoUser !== window._USERINFO.userId
        }
      }
    };  

    const caseDoStatus = caseInfo.isComplete ?
      (<Tag color="red">已完成（{moment(caseInfo.completeDate).format('YYYY-MM-DD HH:mm:ss') }）</Tag>) :
      this.state.saveReturnCompleteDate&&this.state.saveReturnComplete? 
      (<Tag color="red">已完成（{moment(this.state.saveReturnCompleteDate).format('YYYY-MM-DD HH:mm:ss') }）</Tag>):
      (<Tag color="red">执行中</Tag>);
    const description = currentInputTimes==0?(<span style={{'color':'black'}}>
         请选择上方的要执行的版本/轮数选择
      </span>
      ):(
      <span>
        执行版本：<Tag color="blue">{this.state.currentInputVersion}</Tag>
        执行轮数：<Tag color="blue">{this.state.currentInputTimes}</Tag>
      
        执行状态：{caseDoStatus}
      </span>
    );
    const btnSaveText = btnLoading ? "正在保存..." : "保存执行结果";
    const beginSaveDisplay = this.state.selectTreeNodeData.moduleName ? { display: '' } : { display: 'none' };

    const menuItem = this.state.caseHistory.map((item, index) => {
      let strArr = ['版本：' + item.version];

      strArr.push('轮数：（' + item.times + '）');
      let str = (<a>{strArr.join('，') }</a>);

      let attrClick = true;
      if (this.state.selectCaseDoId === item._id) {
        str = (<a><strong>{strArr.join('，') }</strong></a>);
        attrClick = true;
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
    const saveBtnDisplay = { 'display': (this.state.caseHistory.length > 0 ? (currentInputTimes? '' :'none') : 'none'), paddingLeft: 10 };
    const { getFieldProps } = this.props.form;
    const doversionProps = getFieldProps('doversion', {
      rules: [
        { required: true, message: '版本必填' }
      ],

      // valuePropName:this.state.selectVersion
    });
    const dotimesProps = getFieldProps('dotimes', {
      rules: [
        { required: true, type: 'number', message: '轮数必填' }
      ]
    });
    return (
      <div className="selftest-do-content" >
        <div className="case-do-side" >
          <h2>
            开发自测项目列表
            <Tooltip title="刷新" placement="bottom"><a className="icon" onClick={this.reloadTree}><Icon type={this.state.loadingIcon}/></a></Tooltip>
          </h2>
          <div className="case-do-side-tree">
            {/*<ProjectTree apiUrl={API.MODULE_TREE_WITH_CASE_DO_DOT} onSelect={this.onTreeSelect} openDotNode={true} />*/}
            <CaseDoProjectTree apiUrl={API.MODULE_TREE} onSelect={this.onTreeSelect} openDotNode={true} />


          </div>
        </div>

        <Modal confirmLoading={this.state.confirmModuleLoading} maskClosable={false} title="自测版本轮数设置" visible={this.state.modalVisible}
          onOk={this.handleModuleOk} onCancel={this.handleModuleCancel}>
          <div className="caseDistributionAllForm">
            <Form horizontal form={this.props.form}>
             <FormItem
                label="">
               <p>{this.state.selectTreeNodeData.parentText?("当前开始自测执行的项目模块：【"+ this.state.selectTreeNodeData.parentText+"】/【"+ this.state.selectTreeNodeData.moduleName+'】'):'当前开始自测执行的项目模块：无'}</p>
              </FormItem>
              <FormItem label="输入版本" labelCol={{ span: 4 }}>
                <Input {...doversionProps}  style={{width: 280 }} />
              </FormItem>
              <FormItem label="滑入轮数" required  labelCol={{ span: 4 }}
                 wrapperCol={{ span: 14 }}>
                <Slider min={1} max={9}  tipFormatter={null}  marks={{1:'1',
                                                                      2:'2',
                                                                      3:'3',
                                                                      4:'4',
                                                                      5:'5',
                                                                      6:'6',
                                                                      7:'7',
                                                                      8:'8',
                                                                      9:'9'}}
                  included={false}  {...dotimesProps} />
              </FormItem>
            </Form>
          </div>
        </Modal>

        <div className="case-do-container" >
          <h2>开发自测项目列表- {selectModuleName}</h2>
          <div className="case-do-btn-save" >
            <span  style={beginSaveDisplay}>
              <Button type="primary" disabled={this.state.beginTestBtn} style={{ marginLeft: 10,marginRight: 10 }} onClick={this.handleAddVersionInfo}><Icon type="plus" /> 添加执行</Button>
              <Button type="primary" style={saveBtnDisplay}  loading={this.state.btnLoading}  onClick={this.handleSaveDoCaseResult}><Icon type="save" /> {btnSaveText}</Button>
            </span>
            

            <span style={dropdownMenuDisplay}>
              <Dropdown overlay={menu}>
                <a className="ant-dropdown-link">
                  选择要执行的版本/轮数 <Icon type="down" />
                </a>
              </Dropdown>
            </span>
          </div>
          <div style={{ paddingTop: 40}}></div>
            <div className="case-do-toolbar">
              <fieldset className="case-do-case-info" style={dropdownMenuDisplay}>
                <Alert message="执行自测基本信息" 
                  description={description}
                  type="info"
                  showIcon />
              </fieldset>
            </div>

            <div style={{ marginLeft:8,minWidth: 1300, overflowX: 'visible'}}>
              <Table bordered columns={columns}
                rowKey={record => record._id}
                loading={tableLoading}
                pagination={this.state.pagination}
                dataSource={this.state.data}
                onChange={this.handleChange}
                scroll={{ y: 500 }}/>
            </div>

        </div>
      </div>
    );
  }
});

CaseDoTodoList = createForm()(CaseDoTodoList);
export default CaseDoTodoList;
