import './style.less';
import React from 'react';
import ReactDOM from 'react-dom';
import {Radio, Alert, Row, Col, Button, Breadcrumb, Menu, Icon, Switch, TreeSelect, Tag, Tree, Modal, notification, message, Tooltip, Popover, Spin, Table, Tabs, Badge, Select, Form, Checkbox, Input, InputNumber, Affix } from 'antd'
import Ajax from '../../framework/common/ajax';
import reqwest from 'reqwest';
import moment from 'moment';
import API from '../API';
import Storage from '../../framework/common/storage';
import Funs from '../../framework/common/functions';
import * as _ from 'lodash';
import UserSelect from '../case_do/UserSelect';
import PubSubMsg from '../../framework/common/pubsubmsg';
import { CaseDoResultColumns } from '../case_do/CaseDoResult';
import { ProjectVersionTimesTree, OnProSelect } from '../case_do/ProjectVersionTimesTree';
const TreeNode = Tree.TreeNode;
const Option = Select.Option;
const OptGroup = Select.OptGroup;
const FormItem = Form.Item;
const createForm = Form.create;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const CheckboxGroup = Checkbox.Group;
const SubMenu = Menu.SubMenu;
const InputGroup = Input.Group;

/**
 * 用例审核分配，
 */
const top_current_project = Funs.top_current_project +'_'+_USERINFO.userId;
var filterModuleName = [];
let CaseDistribution = React.createClass({
  stateValue: {
    userData: [],
    currentSelectData: {}
  },
  getInitialState() {
    return {
      loading: true,
      treeDataLoading: true,
      confirmLoading: false,
      modalVisible: false,
      modalModleVisible: false,
      modalTitle: '新增任务',
      editTaskId: '',
      dataModule: [],
      tableCaseLoading: false,
      tableModuleLoading: false,
      dataCase: [],
      alertMsg:'点击左侧任务查看模块树',
      tipStyle:{
        display:''
      },
      paginationCase: {
        pageSize: 80
      },
      treeData: [],
      treeModuleData:[],
      selectData: [],
      checked:false,
      expandedKeys: [],
      selectedRowKeys: [],
      moduleSelectedRowKeys: [],
      moduleSelectedRowNames:[],
      checkedKeys:[],
      selectProjectName: '',
      selectModuleName: '',
      saveCaseDoDisabled: true,
      popVisible: false,
      saveLoading: false,
      leftDisplay: true,
      userSelectData: [],
      autoExpandParent: false,
      deleteCaseDoDisabled: true,
      deleteLoading: false,
      filterName: ['高', '中', '低'],
      filteredInfo: null,
      versionInfo: [],
      selectProjectId: '',
      selectVersion: '',
      dotimesInfo: [],
      ispmsProject: false,
      ispmsprojectfortimes: false,
    }

  },
  fetchUserData() {
    let _this = this;
    Ajax.get({
      url: API.USER_ALL_LIST,
      success(res) {
        const result = res.body;

        _this.stateValue.userData = result.data;
      }
    })
  },

  componentDidMount() {
    this.getContainer();
    this.fetchProjectTreeData();
    this.fetchUserData();
    document.addEventListener("click", this.hideMenu, false);
    let _this = this;
    PubSubMsg.subscribe('get_current_project', function (resData) {
      _this.setState({
        alertMsg:'点击左侧任务查看模块树',
         tipStyle:{
            display:''
          },
        treeModuleData:[],
        dataCase:[]
      });
      _this.fetchProjectTreeData();
    });
  },
  fetchProjectTreeData(expandArr) {
    expandArr = expandArr?expandArr:[];
    let _this = this;
    Ajax.get({
      url: API.PROJECT_AUDIT_TREE,
      data:{
        '_id':Storage.local.get(top_current_project) ? Funs.decrypt(Storage.local.get(top_current_project).currentProject, Funs.secret) : null,
        'type': Storage.local.get(top_current_project) ? Storage.local.get(top_current_project).type : null
      },
      success(res) {
        const result = res.body;

        _this.setState({
          treeData: result.data.treeData,
          selectData: result.data.selectData,
          treeDataLoading: false,
          // expandedKeys: expandArr
          expandedKeys:_this.state.expandedKeys?[..._this.state.expandedKeys]:expandArr
        })
      }
    })
  },
  componentWillUnmount() {

    if (this.cmContainer) {
      ReactDOM.unmountComponentAtNode(this.cmContainer);
      document.body.removeChild(this.cmContainer);
      this.cmContainer = null;
    }

    document.removeEventListener("click", this.hideMenu, false);
      PubSubMsg.unsubscribe('get_current_project');
  },
  //获取模块数据
  fetchProjectModuleData(project) {
    let _this = this;
    Ajax.get({
      url: API.PROJECT_TASK_MODULE,
      data: {
        projectId: project.projectId,
        task: project.taskName,
        type: Storage.local.get(top_current_project) ? Storage.local.get(top_current_project).type : null
      },
      before() {

      },
      success(res) {
        const result = res.body;
        let reData = [];
        //this.stateValue.userData;
        result.data.forEach(function (element) {
          reData.push({
            _id: element._id,
            hasDo: element.hasDo,
            moduleName: element.moduleName
          });
        });
        const users = _.union(project.userIds);
        let userSelectData = [];
        _this.stateValue.userData.forEach(item => {
          if (users) {
            users.forEach(user => {
              if (user == item._id) {
                userSelectData.push(item);
              }
            })
          }
        });
        _this.selectModuleId = null;
        _this.setState({
          dataModule: result.data,
          dataCase: [],
          treeModuleData:result.data,
          selectedRowKeys: [],
          moduleSelectedRowKeys: [],
          moduleSelectedRowNames:[],
          saveCaseDoDisabled: true,
          checkedKeys:[],
          selectProjectName: project.projectName,
          userSelectData: userSelectData
        })
      }
    })
  },
  onModuleSelect(info, e){
    const nodeData = e.node.props.nodeData;
    this.stateValue.currentSelectData.moduleName = nodeData.moduleName;
    this.stateValue.currentSelectData.moduleId = nodeData._id;
    let _this = this;
    if (!this.state.saveCaseDoDisabled) {
      Modal.confirm({
        title: '当前用例审核分配任务还未保存，确定要不保存当前任务，切换到其他模块吗',
        content: '点击[取消]继续留在当前模块， 点击[确定]切换到点击的模块',
        onOk() {
          _this.getCaseData(nodeData);
        },
        onCancel() { }
      });
    } else {
      this.getCaseData(nodeData);
    }


  },
  onSelect(info, e, node, event) {
    const nodeData = e.node.props.nodeData;
    if (nodeData.type === 'task') {
      let _this = this;
      if (!this.state.saveCaseDoDisabled) {
        Modal.confirm({
          title: '当前用例审核分配任务还未保存，确定要不保存当前任务，切换到其他模块吗',
          content: '点击[取消]继续留在当前模块， 点击[确定]切换到点击的模块',
          onOk() {
            _this.fetchProjectModuleData(nodeData);
          },
          onCancel() { }
        });
      } else {
        this.fetchProjectModuleData(nodeData);
      }

      this.stateValue.currentSelectData.projectId = nodeData.projectId;
      this.stateValue.currentSelectData.taskName = nodeData.taskName;
      this.stateValue.currentSelectData.projectName = nodeData.projectName;
      this.stateValue.currentSelectData.userIds = nodeData.userIds;
      this.setState({
          alertMsg:'：已分配',
          tipStyle:{
            display:'none'
          },
          moduleSelectedRowKeys:[],
          moduleSelectedRowNames:[]
      })
    } else {

      let expandedKeys = this.state.expandedKeys?[...this.state.expandedKeys]:[];
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
  onExpand(expandedKeys) {
    this.setState({ expandedKeys });
  },
  //获取模块用例数据
    getCaseData(record) {
    let _this = this;
    Ajax.get({
      url: API.PROJECT_TASK_MODULE_CASE,
      data: {
        moduleId: record._id,
        moduleName: record.moduleName,
        ztModule: record.ztModule ? record.ztModule : null,
        hasDo: record.hasDo ? 1 : 0,
        taskName: _this.stateValue.currentSelectData.taskName,
        type: Storage.local.get(top_current_project) ? Storage.local.get(top_current_project).type : null,
      },
      before() {
        _this.setState({
          tableCaseLoading: true,
          tableModuleLoading: true
        })
      },
      success(res) {
        const result = res.body;
        //判断是否展示“模块”字段
        let showChildModuleName = false;
        if (result.data.moduleCount !== 1) {
          showChildModuleName = true;
        }
        _this.showChildModuleName = showChildModuleName;
        _this.selectModuleId = record._id;


        filterModuleName = [];
        result.data.getModuleName.forEach(item => {
          filterModuleName.push({
            text: item.moduleName,
            value: item.moduleName
          });
        });


        _this.setState({
          tableCaseLoading: false,
          tableModuleLoading: false,
          dataCase: result.data.caseList,
          selectedRowKeys: [],
          selectModuleName: record.moduleName,
          saveCaseDoDisabled: true,
          deleteCaseDoDisabled: !record.hasDo,
          filteredInfo: null
        });

      }
    })
  },
  onSelectChange(selectedRowKeys) {
    this.setState({ selectedRowKeys });
  },
  onModuleSelectChange(moduleSelectedRowKeys,e) {
    const checkedNodes = e.checkedNodes;
    let keyArr = [];
    let valueNameArr = [];
    for (var i = 0; i < checkedNodes.length; i++) {
           let item =  checkedNodes[i].props.nodeData;
           keyArr.push(item._id);
           valueNameArr.push(item.moduleName);
    };
    //keyArr 和 moduleSelectedRowKeys 都可
    this.setState({
      checkedKeys:moduleSelectedRowKeys,
      moduleSelectedRowKeys:keyArr,
      moduleSelectedRowNames:valueNameArr
     });
  },
  contextMenuClick(node, e) {
    if (e.key === 'editTaskKey') {
      this.props.form.setFieldsValue({
        doproject: node.nodeData.projectId,
        task: node.nodeData.taskName
      });
      this.setState({
        modalVisible: true,
        modalTitle: '编辑任务信息',
        editTaskId: node.nodeData.id.substring(0, 9)
      })
    } else if (e.key === 'addTaskKey') {
      this.props.form.setFieldsValue({
        doproject: node.nodeData.id,
        task: node.nodeData.task ? node.nodeData.task : ''
      });
      this.setState({
        modalVisible: true,
        modalTitle: '新增任务信息',
        editTaskId: ''
      })
    } else if (e.key === 'deleteTaskKey') {
      let _this = this;
      let option = {
        projectId: node.nodeData.projectId,
        task: node.nodeData.taskName,
        taskId: node.nodeData.id.substring(0, 9),
        type: Storage.local.get(top_current_project) ? Storage.local.get(top_current_project).type : null
      };

      Modal.confirm({
        title: '您是否确认要删除这项任务',
        onOk() {
          Ajax.delete({
            url: API.PROJECT_TASK_DELETE,
            data: option,
            success(res) {
              const result = res.body;

              if (result.status === 200) {
                message.info('删除成功');
                let expandArr = [];
                if(result.data){
                  expandArr.push(result.data);
                }
                _this.fetchProjectTreeData(expandArr);
              } else {
                message.error(result.message);
              }
            }
          })
        },
        onCancel() { },
      });
    }
  },
  hideMenu() {
    const container = this.getContainer();
    container.style.display = 'none';
  },
  onRightClick(info) {
    if (info.node.props.nodeData.type !== 'task' && info.node.props.nodeData.type !== 'project' ) {
      return false;
    }

    const addTaskDisabled = !(info.node.props.nodeData.type === 'project' );
    const editTimesDisabled = !(info.node.props.nodeData.type === 'task');
    let deleteTimesDisabled = false;
    if (info.node.props.nodeData.type === 'task' ) {
      if (info.node.props.nodeData.children && info.node.props.nodeData.children.length > 0  ) {
        deleteTimesDisabled = true;
      }
    }else{
      deleteTimesDisabled = true;
    }

    if (this.toolTip) {
      ReactDOM.unmountComponentAtNode(this.cmContainer);
      this.toolTip = null;
    }

    this.toolTip = (
      <Menu onClick={this.contextMenuClick.bind(this, info.node.props) }>
        <Menu.Item disabled={addTaskDisabled} key="addTaskKey"><Icon type="plus" /> 新增任务信息</Menu.Item>
        <Menu.Item disabled={editTimesDisabled} key="editTaskKey"><Icon type="edit" /> 编辑项目/任务信息</Menu.Item>
        <Menu.Item disabled={deleteTimesDisabled} key="deleteTaskKey"><Icon type="delete" /> 删除项目/任务信息</Menu.Item>
      </Menu>
    );

    const container = this.getContainer();
    container.style.display = '';
    _.assign(this.cmContainer.style, {
      position: 'absolute',
      left: info.event.pageX + 'px',
      top: info.event.pageY + 'px',
      'z-index': 99
    });


    ReactDOM.render(this.toolTip, container);
  },
  getContainer() {
    if (!this.cmContainer) {
      this.cmContainer = document.createElement('div');
      this.cmContainer.className = 'case-do-v-treeContextMenu';
      document.body.appendChild(this.cmContainer);
    }
    return this.cmContainer;
  },
  handleAddVersionInfo() {
    this.props.form.setFieldsValue({
      doproject: '',
      task: ''
    });
    this.setState({
      modalVisible: true,
      modalTitle: '新增任务',
      editTaskId: '',
      selectVersion: '',
      ispmsProject: false,
      ispmsprojectfortimes: false
    });
  },
  handleOk() {
    let _this = this;
    _this.props.form.validateFields((errors, values) => {
      let canSave = true;
      if (errors) {
        delete errors['userSelect'];
        if (!_.isEmpty(errors)) {
          canSave = false;
        }
      }

      if (!canSave) {
        return;
      } else {

        Ajax.post({
          url: API.PROJECT_TASK_SAVE,
          data: {
            taskName: _this.props.form.getFieldValue('task'),
            projectId: _this.props.form.getFieldValue('doproject'),
            type: Storage.local.get(top_current_project) ? Storage.local.get(top_current_project).type : null,
            taskId: _this.state.editTaskId
          },
          success(res) {
            const result = res.body;
            let expandArr = [];
            if(result.data){
              expandArr.push(result.data);
            }
            if (result.status === 200) {
              message.info(result.message);
              _this.fetchProjectTreeData(expandArr);
            } else {
              message.error(result.message);
            }
            _this.stateValue.currentSelectData.taskName =  _this.props.form.getFieldValue('task');
            _this.setState({
              selectVersion: '',
              modalVisible: false,
            })
          }
        })
      }
    });
  },
  handleCancel() {
    this.setState({
      modalVisible: false
    })
  },
  handleModalModleShow() {
    this.setState({
      modalModleVisible: true
    })
  },
 //模块批量设置执行人
  handleModuleOk() {
    const _this = this;
    const userId = this.props.form.getFieldValue('userSelect');

    if (userId && _this.state.moduleSelectedRowKeys && _this.state.moduleSelectedRowKeys.length > 0) {
      if (_this.state.filterName.length == 0) {
        message.info("请勾选模块分配条件", 3)
      } else {
        const moduleIds = _this.state.moduleSelectedRowKeys;

        let moduleNames = [];
        moduleIds.forEach(modu => {
          this.state.dataModule.forEach(item => {
            //判断有勾选的模块存入模块（子模块）id和名称
              let moduleInfo = [];
              if (item.children) {
                var selectm = function (item) {
                 if (modu === item._id) {
                  moduleInfo.push({
                    moduleId: item._id,
                    moduleName: item.moduleName
                  });
                }
                  if (item.children) {
                    item.children.forEach(function (iChildren) {
                      selectm(iChildren);
                    });

                  }
                }

                var dd = selectm(item);

              } else {
                if (modu === item._id) {
                  moduleInfo.push({
                    moduleId: item._id,
                    moduleName: item.moduleName
                  });
                }
              }
              if(moduleInfo && moduleInfo.length > 0){
                  moduleNames.push(moduleInfo);
              }

          })
        });

        Ajax.post({
          url: API.CASE_TASK_SAVE_BY_MULIT_MODULE,
          data: {
            taskName: _this.stateValue.currentSelectData.taskName,
            projectId: _this.stateValue.currentSelectData.projectId,
            projectName: _this.stateValue.currentSelectData.projectName,
            moduleIds: moduleIds,
            moduleNames: moduleNames,//存入已勾选模块（包含子模块）id和名称
            userId: userId,
            ztProduct: Storage.local.get(top_current_project) ? Funs.decrypt(Storage.local.get(top_current_project).currentProject, Funs.secret) : null,
            type: Storage.local.get(top_current_project) ? Storage.local.get(top_current_project).type : null,
            filterName: _this.state.filterName
          },
          before() {
            _this.setState({
              confirmModuleLoading: true
            })
          },
          success(res) {
            const result = res.body;

            if (result.status === 200) {
              _this.setState({
                confirmModuleLoading: false,
                modalModleVisible: false,
                filterName: ['高', '中', '低']
             })

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
              }

              _this.fetchProjectModuleData({
                    projectId: _this.stateValue.currentSelectData.projectId,
                    taskName: _this.stateValue.currentSelectData.taskName,
                    projectName: _this.stateValue.currentSelectData.projectName,
                    auditUsers: _this.stateValue.currentSelectData.auditUsers,
                    userIds: _this.stateValue.currentSelectData.userIds
              });
            } else {
              message.error(result.message);

              _this.setState({
                modalModleVisible: false,
                filterName: ['高', '中', '低']
              })
            }
          }
        })
      }

    } else {
      _this.setState({
        modalModleVisible: false,
        filterName: ['高', '中', '低']
      })
    }
  },
  handleModuleCancel() {
    this.setState({
      modalModleVisible: false,
      filterName: ['高', '中', '低']
    })
  },
  userSelectChange(row, e, label) {
    const dataCase = [...this.state.dataCase];

    dataCase.forEach(item => {
      if (item._id === row._id) {
        item.auditUser = e;
        item.auditUserName = label.props.children.split('(')[0];
      }
    });
    this.setState({
      dataCase: dataCase,
      saveCaseDoDisabled: false
    });
  },
  userSelectChange1(row, e) {
    if (!e) { // 清空按钮的事件
      const dataCase = [...this.state.dataCase];
      dataCase.forEach(item => {
        if (item._id === row._id) {
          item.auditUser = e;
          item.auditUserName = e;
        }
      });
      this.setState({
        dataCase: dataCase,
        saveCaseDoDisabled: false
      });
    }
  },
  handlePopVisibleChange(visible) {
    this.props.form.setFieldsValue({
      userSelectSet: ''
    });
    this.setState({ popVisible: visible });
  },
  renderAuditUser(o, row, index) {
    if (!row.auditTestResult) {
       return (
        <UserSelect value={o} data={this.state.userSelectData} style={{ width: 160 }} onChange={this.userSelectChange1.bind(this, row) } onSelect={this.userSelectChange.bind(this, row) } />
      );
    } else {
      return (<span>{row.auditUserName}({row.auditUser}) </span>);
    }
  },
  mulitSetMulitAuditUser(e, label) {
    if (e) {
      const dataCase = [...this.state.dataCase];
      dataCase.forEach(item => {
        this.state.selectedRowKeys.forEach(key => {
          if (item._id === key) {
            item.auditUser = e;
            item.auditUserName = label.props.children.split('(')[0];
          }
        })
      });

      this.setState({
        dataCase: dataCase,
        saveCaseDoDisabled: false,
        selectedRowKeys: []
      });
    }
  },
  handleSaveCaseDo() {


    if (!this.stateValue.currentSelectData.taskName ||
      !this.stateValue.currentSelectData.projectId ||
      !this.stateValue.currentSelectData.moduleId) {
      return false;
    }

    const _this = this;
    let dataCase = [...this.state.dataCase];
    let saveData = [];
    dataCase.forEach(ci => {
      if (ci.auditUser  ) {
      // if (ci.auditUser  && ci.project === _this.stateValue.currentSelectData.projectId) {
        saveData.push({
          caseId: ci._id,
          // project: ci.project,
          // module: ci.module,
          childModuleName: ci.childModuleName,
          // moduleName: ci.moduleName,
          auditTestResult: ci.auditTestResult,
          auditUser: ci.auditUser,
          auditUserName: ci.auditUserName
        });
      }
    });

    if (saveData.length > 0) {
      Ajax.post({
        url: API.AUDIT_SAVE_ALLOCATION_BY_TASK,
        data: {
          taskName: _this.stateValue.currentSelectData.taskName,
          projectId: _this.stateValue.currentSelectData.projectId,
          projectName: _this.stateValue.currentSelectData.projectName,
          moduleId: _this.stateValue.currentSelectData.moduleId,
          moduleName: _this.stateValue.currentSelectData.moduleName,
          type: Storage.local.get(top_current_project) ? Storage.local.get(top_current_project).type : null,
          ztProduct: Storage.local.get(top_current_project) ? Funs.decrypt(Storage.local.get(top_current_project).currentProject, Funs.secret) : null,
          data: saveData
        },
        before() {
          _this.setState({
            saveLoading: true
          })
        },
        success(res) {
          const result = res.body;

          if (result.status === 200) {
            _this.setState({
              saveLoading: false,
              saveCaseDoDisabled: true
            })

            message.info(result.message);

            _this.fetchProjectModuleData({
              projectId: _this.stateValue.currentSelectData.projectId,
              taskName: _this.stateValue.currentSelectData.taskName,
              projectName: _this.stateValue.currentSelectData.projectName,
              auditUsers: _this.stateValue.currentSelectData.auditUsers,
              userIds: _this.stateValue.currentSelectData.userIds
            });
          } else {
            message.error(result.message);
          }
        }
      })
    } else {
      message.warning('没有需要保存的数据');
    }
  },
  handelSplitClick() {
    this.setState({ leftDisplay: !this.state.leftDisplay });
  },
   /**
   * 删除该用例审核执行任务
   */
  handleDeleteCaseDo() {
    const _this = this;
    Modal.confirm({
      title: '确定要删除当前用例审核执行任务【' + _this.state.selectModuleName + '】吗',
      onOk() {
        let option = {
          taskName: _this.stateValue.currentSelectData.taskName,
          projectId: _this.stateValue.currentSelectData.projectId,
          moduleId: _this.stateValue.currentSelectData.moduleId,
          type: Storage.local.get(top_current_project) ? Storage.local.get(top_current_project).type : null
        };

        Ajax.delete({
          url: API.CASE_TASK_DELETE,
          data: option,
          before() {
            _this.setState({
              deleteLoading: true
            })
          },
          success(res) {
            const result = res.body;
            _this.setState({
              deleteLoading: false,
              deleteCaseDoDisabled: false
            })
            if (result.status === 200) {
              message.info('删除成功');

              _this.fetchProjectModuleData({
                    projectId: _this.stateValue.currentSelectData.projectId,
                    taskName: _this.stateValue.currentSelectData.taskName,
                    projectName: _this.stateValue.currentSelectData.projectName,
                    auditUsers: _this.stateValue.currentSelectData.auditUsers,
                    userIds: _this.stateValue.currentSelectData.userIds
              });
            } else {
              message.error(result.message);
            }
          }
        })
      },
      onCancel() { }
    });
  },
  onProSelect(v, opt) {
    OnProSelect.onProSelect(this, v, opt);
  },
  onTreeSelect(info, e, node, event) {
    const nodeData = e.node.props.nodeData;
  },

  handleChange(pagination, filters, sorter) {
    this.setState({
      filteredInfo: filters
    });
  },
  selectAllChange(e){
    let selectAllArr = [];
    let selectAllNameArr = [];
    if(e.target.checked){
          const loopModule = data => data.map((item) => {
                if (item.children && item.children.length > 0) {
                     loopModule(item.children);
                 }
                     selectAllArr.push(item._id);
                     selectAllNameArr.push(item.moduleName);
           });
          loopModule(this.state.treeModuleData);
    }else{
       selectAllArr = [];
       selectAllNameArr = [];
    }
    this.setState({
      checkedKeys:selectAllArr,
      checked: e.target.checked,
      moduleSelectedRowKeys:selectAllArr,
      moduleSelectedRowNames:selectAllNameArr
    });
  },
  render() {
    // let tipSpan = this.state.alertMsg === '：已分配'? <Icon type="check-circle" /> : null;
    let tipSpan = this.state.alertMsg === '：已分配'? <Tag color="green">已分</Tag> : null;
    const loopModule = data => data.map((item) => {
      // let  iconZone =  item.hasDo? <Icon type="check-circle" /> : null;
      let  iconZone =  item.hasDo? <Tag color="green">已分</Tag> : null;

      if (item.children && item.children.length > 0) {
         return (
            <TreeNode key={item._id} title={(<span style={{ color: '#black' }}>{iconZone}{item.projectName ? item.projectName : item.moduleName}</span>) } nodeData={item} isLeaf={true} expanded={true} >
              {loopModule(item.children) }
            </TreeNode>
          );
      }
      let title = item.projectName ? item.projectName : item.moduleName;
       return <TreeNode key={item._id} title={(<sapn style={{ color: '#black' }}>{iconZone}{title}</sapn>) } nodeData={item} expanded={true} isLeaf={true} />;
    });

    let {filteredInfo} = this.state;
    filteredInfo = filteredInfo || {};
    const selectModuleId = this.selectModuleId;

   let columnsCase = [{
      title: '审核人',
      dataIndex: 'auditUser',
      width: 180,
      className: "tdAlignCenter",
      render: this.renderAuditUser
    }, {
      title: '审核结果',
      className: "tdAlignCenter",
      // dataIndex: 'caseId.qaAudit.auditResult',
      dataIndex: 'auditTestResult',
      width: 80,
      render(text) {
        if (text === '通过') {
          return (<span style={{ color: 'green' }}>{text}</span>);
        } else if (text === '不通过') {
          return (<span style={{ color: 'red' }}>{text}</span>);
        } else {
          return (<span style={{ color: 'gray' }}>待审核</span>);
        }
      }
    },{
      title: '审核备注',
      dataIndex: 'auditTestResultRemark',
      width: 170,
      className: "tdAlignCenter"
    }, ];
    columnsCase = columnsCase.concat(CaseDoResultColumns.getColumns());
    if (this.showChildModuleName) {
      columnsCase.splice(2, 0, {
        title: '模块',
        width: 110,
        dataIndex: 'childModuleName',
        render: function (o, row, index) {
          return (<span>{row.childModuleName}</span>);
        },
        filters: filterModuleName,
        filteredValue: filteredInfo.childModuleName,
        onFilter: (value, record) => record.childModuleName === value
      });
    }
    const loop = data => data.map((item) => {
      if (item.children && item.children.length > 0) {
        return (
          <TreeNode key={item.id} title={item.name} nodeData={item} isLeaf={true} expanded={true} >
            { loop(item.children) }
          </TreeNode>
        );
      }

      return <TreeNode key={item.id} title={item.name} nodeData={item} expanded={true} isLeaf={true} />;
    });

    const loopTreeSelect = data => data.map((item) => {
      if (item.children && item.children.length > 0) {
        return (
          <TreeNode key={item.id} title={item.name} disabled={item.type !== 'project'} nodeData={item} value={item.id} expanded={true} >
            { loopTreeSelect(item.children) }
          </TreeNode>
        );
      }

      return <TreeNode key={item.id} disabled={item.type !== 'project'} title={item.name} nodeData={item} expanded={true} value={item.id} />;
    });

    const { getFieldProps } = this.props.form;

    const doprojectProps = getFieldProps('doproject', {
      rules: [
        { required: true, message: '项目必选' }
      ],
    });


    const taskProps = getFieldProps('task', {
      rules: [
        { required: true, message:'任务名称必填',type: 'string'}
      ],
    });

    const userSelectSetProps = getFieldProps('userSelectSet', {
      rules: [
        { required: false }
      ],
    });

    const userSelectProps = getFieldProps('userSelect', {
      rules: [
        { required: true, message: '用例审核人必填' }
      ],
    });
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: this.onSelectChange,
      getCheckboxProps(record) {
        return {
          disabled: !!record.auditTestResult
        }
      }
    };

    const popoverContent = (
      <div>
        <UserSelect {...userSelectSetProps} data={this.state.userSelectData} style={{ width: 180 }} onSelect={this.mulitSetMulitAuditUser} />
      </div>
    );
    const leftDisplay = { display: this.state.leftDisplay ? '' : 'none' };
    const splitLeft = { left: this.state.leftDisplay ? 445 : 0 };
    const rightMarginLeft = { marginLeft: this.state.leftDisplay ? 460 : 15 };

    const selectedModules = this.state.moduleSelectedRowKeys.map( (item,index) => {
      /*      if (this.state.moduleSelectedRowKeys.indexOf(item._id) >= 0) {
              return (<li key={item._id}><strong>○ {item.moduleName}</strong></li>);
            }*/
        return (<li key={item}><strong>○ {this.state.moduleSelectedRowNames[index]}</strong></li>);
    });

    let  selectAllComp =({}) => {};
    if(this.state.treeModuleData && this.state.treeModuleData.length > 0){
    /*  selectAllComp =  (<Tooltip placement='right' title='全选/反选模块' >
                                  <Switch size="small"  onChange={this.selectAllChange}  style={{float:'right',top:8}}/>
               </Tooltip>);*/
      selectAllComp = (<Tooltip placement='top' title='全选/反选模块' >
                  <div  style={{ width: 35,display:'inline-block',textAlign:'center'}} > <Checkbox  checked={this.state.checked} onChange={this.selectAllChange} ></Checkbox> </div>
                </Tooltip>);
    }

    return (
      <div>
        <Modal confirmLoading={this.state.confirmModuleLoading} maskClosable={false} title="按模块勾选批量设置审核人" visible={this.state.modalModleVisible}
          onOk={this.handleModuleOk} onCancel={this.handleModuleCancel}>
          <div className="caseDistributionAllForm">
            <Form horizontal form={this.props.form}>
              <FormItem
                label="选择审核人：">
                <UserSelect {...userSelectProps} data={this.state.userSelectData} style={{ width: 180 }} />
              </FormItem>
            </Form>
            <ol className="case-do-selectedModules">
              {selectedModules}
            </ol>
          </div>
        </Modal>
        <Modal confirmLoading={this.state.confirmLoading} maskClosable={false} title={this.state.modalTitle} visible={this.state.modalVisible}
          onOk={this.handleOk} onCancel={this.handleCancel}>
          <div className="caseDistributionForm">
            <Form horizontal>
              <FormItem  label="项目：">
                   <TreeSelect {...doprojectProps}
                   treeDefaultExpandAll={true}
                    onSelect={this.onProjectSelect}
                    dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                    allowClear>
                   {loopTreeSelect(this.state.selectData) }
                  </TreeSelect>
                </FormItem>

                <FormItem  label="任务名称：">
                          <Input {...taskProps}    />
                </FormItem>
            </Form>
          </div>
        </Modal>
        {/*<div className="case-do-v-operate">
          <Button type="primary"  onClick={this.handleAddVersionInfo}><Icon type="plus" /> 新增任务</Button>
        </div>*/}
        <div className="case-do-v-content">
          <div className="case-do-v-left" style={leftDisplay}>
            <h2>项目列表
                   <Button  style={{float:'right',marginTop:3}}  size="small"  type="primary" onClick={this.handleAddVersionInfo}><Icon type="plus" /> 新增任务</Button>
            </h2>
            <div className="case-tree">
              <ProjectVersionTimesTree
                treeDataLoading={this.state.treeDataLoading}
                treeData={this.state.treeData}
                onProjectSelect={this.onProSelect}
                expandedKeys={this.state.expandedKeys}
                onSelect={this.onSelect}
                onExpand={this.onExpand}
                onRightClick={this.onRightClick}>
              </ProjectVersionTimesTree>
            </div>
          </div>
          <div className="case-do-v-middle" style={leftDisplay}>
            <h2>（{this.state.selectProjectName}）
               模块列表
            </h2>

            <div className="case-do-v-container">
              <div className="case-do-v-bar">
               {selectAllComp}
                <Button type="primary" disabled={!(this.state.moduleSelectedRowKeys.length > 0) } onClick={this.handleModalModleShow}><Icon type="save" /> 按模块批量设置审核人</Button>
              </div>
              <div style={this.state.tipStyle}>
                <span  className='tipSpan'  > {tipSpan}{this.state.alertMsg} </span>
              </div>
              <div className="case-do-module-select">
                       <Tree   showLine  checkable
                       checkedKeys = {this.state.checkedKeys}
                        onSelect={this.onModuleSelect}
                        onCheck={this.onModuleSelectChange}   >
                        {loopModule(this.state.treeModuleData) }
                      </Tree>
              </div>
            </div>
          </div>
          <Tooltip placement={this.state.leftDisplay ? 'left' : 'right'} title='显示/隐藏左边'><div className="case-do-v-split" style={splitLeft} onClick={this.handelSplitClick}>{this.state.leftDisplay ? '◀' : '▶'}</div></Tooltip>
          <div className="case-do-v-right" style={rightMarginLeft}>
            <h2>（{this.state.selectModuleName}）模块用例列表</h2>
            <div className="case-do-v-container">
              <div className="case-do-v-bar">
                <Button type="primary" disabled={this.state.saveCaseDoDisabled} loading={this.state.saveLoading} onClick={this.handleSaveCaseDo} ><Icon type="save" /> 保存用例审核任务</Button>

                <Popover content={popoverContent} title="设置审核人" trigger="click" placement="bottomLeft"
                  visible={this.state.popVisible} onVisibleChange={this.handlePopVisibleChange}>
                  <Button style={{ marginLeft: 10 }} type="ghost" disabled={!(this.state.selectedRowKeys.length > 0) }>批量设置审核人</Button>
                </Popover>

                <span style={{ float: 'right' }}>
                  <Button type="dashed" disabled={this.state.deleteCaseDoDisabled} loading={this.state.deleteLoading} onClick={this.handleDeleteCaseDo}>删除该用例审核任务</Button>
                </span>
              </div>
              <div className="caseDataTable" style={{ minWidth: 1300, overflowX: 'visible' }}>
                <Table bordered columns={columnsCase} size="middle"
                  rowKey={record => record._id}
                  rowSelection={rowSelection}
                  loading={this.state.tableCaseLoading}
                  pagination={this.state.paginationCase}
                  dataSource={this.state.dataCase}
                  onChange={this.handleChange}
                  scroll={{ y: 500 }}/>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
});

CaseDistribution = createForm()(CaseDistribution);
export default CaseDistribution;
