import './style.less';
import React from 'react';
import ReactDOM from 'react-dom';
import { Radio, Alert, Row, Col, Button, DatePicker, Breadcrumb, Menu, Icon, Switch, TreeSelect, Tag, Tree, Modal, notification, message, Tooltip, Popover, Spin, Table, Tabs, Badge, Select, Form, Checkbox, Input, InputNumber, Affix } from 'antd'
import Ajax from '../../framework/common/ajax';
import reqwest from 'reqwest';
import moment from 'moment';
import API from '../API';
import Storage from '../../framework/common/storage';
import Funs from '../../framework/common/functions';
import * as _ from 'lodash';
import UserSelect from './UserSelect';
import PubSubMsg from '../../framework/common/pubsubmsg';
import { CaseDoResultColumns } from './CaseDoResult';
import { ProjectVersionTimesTree, OnProSelect } from './ProjectVersionTimesTree';
const TreeNode = Tree.TreeNode;
const Option = Select.Option;
const OptGroup = Select.OptGroup;
const FormItem = Form.Item;
const createForm = Form.create;
const RadioGroup = Radio.Group;
const CheckboxGroup = Checkbox.Group;
const SubMenu = Menu.SubMenu;
const InputGroup = Input.Group;

/**
 * 用例执行分配， 按版本 轮数 设置 后 进行人员分配
 */

const top_current_project = Funs.top_current_project + '_' + _USERINFO.userId;

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
      modalTitle: '新增版本/轮数',
      editVersionId: '',
      tableModuleLoading: false,
      dataModule: [],
      tableDataModule: [],//表格一级模块数据
      paginationModule: {
        pageSize: 200
      },
      tableCaseLoading: false,
      dataCase: [],
      paginationCase: {
        pageSize: 80
      },
      treeData: [],
      selectData: [],
      expandedKeys: [],
      selectedRowKeys: [],
      moduleSelectedRowKeys: [],
      selectProjectName: '',
      selectModuleName: '',
      saveCaseDoDisabled: true,
      popVisible: false,
      saveLoading: false,
      leftDisplay: true,
      userSelectData: [],
      autoExpandParent: false,
      doversionDisabled: false,
      doenvDisabled: true,
      deleteCaseDoDisabled: true,
      deleteLoading: false,
      isDisplay: false,
      CheckboxVisible: "",
      checkedValues: ['高', '中', '低'],
      filterName: ['高', '中', '低'],
      filteredInfo: null,
      versionInfo: [],
      selectProjectId: '',
      selectVersion: '',
      dotimesInfo: [],
      ispmsProject: false,
      dotimesDisabled: false,
      ispmsprojectfortimes: false,
      QAM_taskId: 0,
      oldData: {},
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
      _this.fetchProjectTreeData();
      //顶部产品、项目变化时，中间及右侧用例执行页面显示为空
      _this.setState({
          tableModuleLoading: false,
          dataModule: [],
          tableDataModule: [],
          dataCase: []
        })
    });
  },
  fetchProjectTreeData() {
    let _this = this;
    Ajax.get({
      url: API.PROJECT_VERSION_TREE,
      data: {
        '_id': Storage.local.get(top_current_project) ? Funs.decrypt(Storage.local.get(top_current_project).currentProject, Funs.secret) : null,
        'type': Storage.local.get(top_current_project) ? Storage.local.get(top_current_project).type : null
      },
      success(res) {
        const result = res.body;
        _this.setState({
          treeData: result.data.treeData,
          selectData: result.data.selectData,
          treeDataLoading: false,
          expandedKeys: [..._this.state.expandedKeys]
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
      url: API.PROJECT_VERSION_MODULE,
      data: {
        projectId: project.projectId,
        times: project.times,
        version: project.version,
        env: project.env,
        type: Storage.local.get(top_current_project) ? Storage.local.get(top_current_project).type : null
      },
      before() {
        _this.setState({
          tableModuleLoading: true
        })
      },
      success(res) {
        const result = res.body;
        _this.stateValue.currentSelectData.taskId = result.message;//获取到的是taskId
        const pagination = _this.state.paginationModule;
        let reData = [];
        pagination.total = result.data.length;
        //this.stateValue.userData;
        result.data.forEach(function (element) {
          reData.push({
            _id: element._id,
            hasDo: element.hasDo,
            indexForSort: element.indexForSort,
            ztModule: element.ztModule ? element.ztModule : null,//增加ztModule用来获取模块用例
            moduleName: element.moduleName
          });
        });
        const users = _.union(project.userIds,project.users);
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
          tableModuleLoading: false,
          dataModule: result.data,
          tableDataModule: reData,
          dataCase: [],
          selectedRowKeys: [],
          moduleSelectedRowKeys: [],
          saveCaseDoDisabled: true,
          selectProjectName: project.projectName,
          userSelectData: userSelectData,
          isDisplay: true
        })
      }
    })
  },
  onSelect(info, e, node, event) {
    const nodeData = e.node.props.nodeData;
    if (nodeData.type === 'times') {
      let _this = this;
      if (!this.state.saveCaseDoDisabled) {
        Modal.confirm({
          title: '当前用例执行分配任务还未保存，确定要不保存当前任务，切换到其他模块吗',
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
      this.stateValue.currentSelectData.times = nodeData.times;
      this.stateValue.currentSelectData.version = nodeData.version;
      this.stateValue.currentSelectData.env = nodeData.env;
      this.stateValue.currentSelectData.projectName = nodeData.projectName;
      this.stateValue.currentSelectData.auditUsers = nodeData.auditUsers;
      this.stateValue.currentSelectData.userIds = nodeData.userIds;
    } else {
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
  onExpand(expandedKeys) {
    this.setState({ expandedKeys, autoExpandParent: false });
  },
  //获取模块用例数据
  getCaseData(record) {
    let _this = this;
    Ajax.get({
      url: API.PROJECT_VERSION_MODULE_CASE,
      data: {
        moduleId: record._id,
        moduleName: record.moduleName,
        ztModule: record.ztModule ? record.ztModule : null,
        hasDo: record.hasDo ? 1 : 0,
        version: _this.stateValue.currentSelectData.version,
        times: _this.stateValue.currentSelectData.times,
        type: Storage.local.get(top_current_project) ? Storage.local.get(top_current_project).type : null,
        env: _this.stateValue.currentSelectData.env
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
        // _this.state.dataModule.forEach(item => {
        //   if (item._id == _this.selectModuleId) {
        //     var getModuleName = function (item) {
        //       filterModuleName.push({
        //         text: item.moduleName,
        //         value: item.moduleName
        //       });
        //       if (item.children) {
        //         item.children.forEach(function (iChildren) {
        //           getModuleName(iChildren);
        //         });

        //       }
        //     }
        //     var getM = getModuleName(item);
        //   }
        // });
        // console.log(filterModuleName);

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
  onRowClick(record, index) {
    let _this = this;
    if (!this.state.saveCaseDoDisabled) {
      Modal.confirm({
        title: '当前用例执行分配任务还未保存，确定要不保存当前任务，切换到其他模块吗',
        content: '点击[取消]继续留在当前模块， 点击[确定]切换到点击的模块',
        onOk() {
          _this.stateValue.currentSelectData.moduleName = record.moduleName;
          _this.stateValue.currentSelectData.moduleId = record._id;
          _this.getCaseData(record);
        },
        onCancel() { }
      });
    } else {
      _this.stateValue.currentSelectData.moduleName = record.moduleName;
      _this.stateValue.currentSelectData.moduleId = record._id;
      _this.getCaseData(record);
    }
  },
  onSelectChange(selectedRowKeys) {
    this.setState({ selectedRowKeys });
  },
  onModuleSelectChange(moduleSelectedRowKeys) {
    this.setState({ moduleSelectedRowKeys });
  },
  contextMenuClick(node, e) {
    if (e.key === 'editVersionTimes') {
      //获取回填的计划时间 12.7 cyn
      const _this = this;
      let sendData = node.nodeData;
      sendData.proType = Storage.local.get(top_current_project) ? Storage.local.get(top_current_project).type : null;
      Ajax.post({
        url: API.PROJECT_VERSION_MENUGETDATA,
        data: sendData,
        success(res) {
          const result = res.body;
          if (result.status === 200) {
            _this.props.form.setFieldsValue({
              doproject: node.nodeData.projectId,
              doversion: node.nodeData.version,
              dotimes: node.nodeData.times,
              doenv: node.nodeData.env,
              test: node.nodeData.qa,
              development: node.nodeData.development,
              endDate: result.data && result.data.planEndDate ? new Date(moment(result.data.planEndDate).format('YYYY-MM-DD HH:mm:ss')) : null,
              startDate: result.data && result.data.planStartDate ? new Date(moment(result.data.planStartDate).format('YYYY-MM-DD HH:mm:ss')) : null
            });
          } else {
            message.error(result.message);
          }
        }
      })
      this.setState({
        modalVisible: true,
        modalTitle: '编辑',
        editVersionId: node.nodeData.id.substring(0, 9),
        doversionDisabled: false,
        dotimesDisabled: false,
        doenvDisabled: node.nodeData.env ? false : true,
        oldData: node.nodeData  //正常这里 使用上面接口result.data返回回来的ID比较好
      })
    } else if (e.key === 'addTimes') {
      this.props.form.setFieldsValue({
        doproject: node.nodeData.projectId,
        doversion: node.nodeData.version,
        doenv: node.nodeData.env ? node.nodeData.env : '',
        dotimes: '',
        test: node.nodeData.qa,
        development: node.nodeData.development,
        startDate: null,
        endDate: null
      });
      this.setState({
        modalVisible: true,
        modalTitle: '新增轮数信息',
        editVersionId: '',
        doversionDisabled: true,
        dotimesDisabled: false,
        doenvDisabled: node.nodeData.env ? false : true,
        oldData: {}
      })
    } else if (e.key === 'deleteVersionTimes') {
      let _this = this;
      let option = {
        projectId: node.nodeData.projectId,
        version: node.nodeData.version,
        env: node.nodeData.env,
        versionId: node.nodeData.id.substring(0, 9),
        type: Storage.local.get(top_current_project) ? Storage.local.get(top_current_project).type : null
      };
      if (node.nodeData.type === 'times') {
        option.times = node.nodeData.times;
      } else if (node.nodeData.type === 'version') {

      }
      Modal.confirm({
        title: '您是否确认要删除这项内容',
        onOk() {
          Ajax.delete({
            url: API.PROJECT_VERSION_DELETE,
            data: option,
            success(res) {
              const result = res.body;

              if (result.status === 200) {
                message.info('删除成功');

                _this.fetchProjectTreeData();
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
    if (info.node.props.nodeData.type !== 'times' && info.node.props.nodeData.type !== 'version' && info.node.props.nodeData.type !== 'env') {
      return false;
    }

    const addTimesDisabled = !(info.node.props.nodeData.type === 'version' || info.node.props.nodeData.type === 'env');
    const editTimesDisabled = !(info.node.props.nodeData.type === 'times');
    let deleteTimesDisabled = false;
    if (info.node.props.nodeData.type === 'version') {
      if (info.node.props.nodeData.children && info.node.props.nodeData.children.length > 0) {
        deleteTimesDisabled = true;
      }
    }

    if (this.toolTip) {
      ReactDOM.unmountComponentAtNode(this.cmContainer);
      this.toolTip = null;
    }
    // this.toolTip = (<span onClick={this.contextMenuClick}>{info.node.props.title}</span>);
    this.toolTip = (
      <Menu onClick={this.contextMenuClick.bind(this, info.node.props)}>
        <Menu.Item disabled={addTimesDisabled} key="addTimes"><Icon type="plus" /> 新增轮数信息</Menu.Item>
        <Menu.Item disabled={editTimesDisabled} key="editVersionTimes"><Icon type="edit" /> 编辑项目/轮数信息</Menu.Item>
        <Menu.Item disabled={deleteTimesDisabled} key="deleteVersionTimes"><Icon type="delete" /> 删除项目/轮数信息</Menu.Item>
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
      doversion: '',
      dotimes: ' ',
      doenv: '',
      test: '',
      development: '',
      startDate: null,
      endDate: null
    });
    this.setState({
      modalVisible: true,
      modalTitle: '新增版本/轮数',
      editVersionId: '',
      doversionDisabled: true,
      dotimesDisabled: true,
      selectVersion: '',
      ispmsProject: false,
      ispmsprojectfortimes: false,
      oldData: {}
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

        //给三处插数据
        var updateBody = {};
        updateBody.id = null,
          updateBody.taskId = parseInt(_this.state.QAM_taskId),//taskId
          updateBody.round = parseInt(_this.props.form.getFieldValue('dotimes')), //轮数
          updateBody.startTime = "", //开始时间
          updateBody.endTime = "", //结束时间
          updateBody.isAPI = 0, //都为0
          updateBody.isPerformance = 0,//都为0
          updateBody.isSecurity = 0,//都为0
          updateBody.isStability = 0,//都为0
          updateBody.isFitness = 0,//都为0
          updateBody.riskEstimateSummary = null//默认空

        if (updateBody.taskId && updateBody.taskId > 0) {
          Ajax.post({
            url: API.UPDATE_QAM_TIMES,
            data: updateBody,
            success: (result) => {
              console.log('qam 执行成功');
            }
          });
        }

        Ajax.post({
          url: API.PROJECT_VERSION_SAVE,
          data: {
            version: _this.props.form.getFieldValue('doversion'),
            times: _this.props.form.getFieldValue('dotimes'),
            env: _this.props.form.getFieldValue('doenv'),
            projectId: _this.props.form.getFieldValue('doproject'),
            development: _this.props.form.getFieldValue('development'),
            planStartDate: moment(_this.props.form.getFieldValue('startDate')).format('YYYY-MM-DD HH:mm:ss'),
            planEndDate: moment(_this.props.form.getFieldValue('endDate')).format('YYYY-MM-DD HH:mm:ss'),
            qa: _this.props.form.getFieldValue('test'),
            versionId: _this.state.editVersionId,
            oldData: _this.state.oldData,
            type: Storage.local.get(top_current_project) ? Storage.local.get(top_current_project).type : null,
            headerId: Storage.local.get(top_current_project) ? Funs.decrypt(Storage.local.get(top_current_project).currentProject, Funs.secret) : null
          },
          success(res) {
            console.log('本地轮数 执行成功');
            const result = res.body;

            if (result.status === 200) {
              message.info(result.message);
              _this.fetchProjectTreeData();
            } else {
              message.error(result.message);
            }

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
            if (modu === item._id) {
              let moduleInfo = [];
              if (item.children) {
                var selectm = function (item) {
                  moduleInfo.push({
                    moduleId: item._id,
                    moduleName: item.moduleName
                  });
                  if (item.children) {
                    item.children.forEach(function (iChildren) {
                      selectm(iChildren);
                    });

                  }
                }

                var dd = selectm(item);

              } else {
                moduleInfo.push({
                  moduleId: item._id,
                  moduleName: item.moduleName
                });
              }
              moduleNames.push(moduleInfo);
            }


          })
        });

        if (_this.stateValue.currentSelectData.taskId && _this.stateValue.currentSelectData.taskId != 0) {
          //给三处插开始时间数据
          var updateBody = {};
          updateBody.id = null,
            updateBody.taskId = +_this.stateValue.currentSelectData.taskId,//taskId
            updateBody.round = +_this.stateValue.currentSelectData.times, //轮数
            updateBody.startTime = moment().format('YYYY/MM/DD'), //开始时间
            updateBody.endTime = "", //结束时间
            updateBody.isAPI = 0, //都为0
            updateBody.isPerformance = 0,//都为0
            updateBody.isSecurity = 0,//都为0
            updateBody.isStability = 0,//都为0
            updateBody.isFitness = 0,//都为0
            updateBody.riskEstimateSummary = null//默认空

          Ajax.post({
            url: API.UPDATE_QAM_TIMES,
            data: updateBody,
            success: (result) => {
              console.log('qam 中间批量执行插入开始时间成功');
            }
          });

        }

        Ajax.post({
          url: API.CASE_DO_SAVE_BY_MULIT_MODULE,
          data: {
            version: _this.stateValue.currentSelectData.version,
            projectId: _this.stateValue.currentSelectData.projectId,
            projectName: _this.stateValue.currentSelectData.projectName,
            times: _this.stateValue.currentSelectData.times,
            env: _this.stateValue.currentSelectData.env,
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
                filterName: ['高', '中', '低'],
                checkedValues: ['高', '中', '低'],
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
                times: _this.stateValue.currentSelectData.times,
                version: _this.stateValue.currentSelectData.version,
                env: _this.stateValue.currentSelectData.env,
                projectName: _this.stateValue.currentSelectData.projectName,
                auditUsers: _this.stateValue.currentSelectData.auditUsers,
                users: _this.stateValue.currentSelectData.users,
                userIds: _this.stateValue.currentSelectData.userIds
              });
            } else {
              message.error(result.message);

              _this.setState({
                modalModleVisible: false,
                filterName: ['高', '中', '低'],
                checkedValues: ['高', '中', '低'],
              })
            }
          }
        })
      }

    } else {
      _this.setState({
        modalModleVisible: false,
        filterName: ['高', '中', '低'],
        checkedValues: ['高', '中', '低'],
      })
    }
  },
  handleModuleCancel() {
    this.setState({
      modalModleVisible: false,
      filterName: ['高', '中', '低'],
      checkedValues: ['高', '中', '低'],
    })
  },
  userSelectChange(row, e, label) {
    const dataCase = [...this.state.dataCase];

    dataCase.forEach(item => {
      if (item._id === row._id) {
        item.caseDoUser = e;
        item.caseDoUsername = label.props.children.split('(')[0];
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
          item.caseDoUser = e;
          item.caseDoUsername = e;
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
  renderCaseDoUser(o, row, index) {
    if (!row.caseTestResult) {

      return (
        <UserSelect value={o} data={this.state.userSelectData} style={{ width: 160 }} onChange={this.userSelectChange1.bind(this, row)} onSelect={this.userSelectChange.bind(this, row)} />
      );
    } else {
      return (<span>{row.caseDoUsername}({row.caseDoUser}) </span>);
    }
  },
  mulitSetMulitCaseDoUser(e, label) {
    if (e) {
      const dataCase = [...this.state.dataCase];
      dataCase.forEach(item => {
        this.state.selectedRowKeys.forEach(key => {
          if (item._id === key) {
            item.caseDoUser = e;
            item.caseDoUsername = label.props.children.split('(')[0];
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
    if (!this.stateValue.currentSelectData.version ||
      !this.stateValue.currentSelectData.projectId ||
      !this.stateValue.currentSelectData.times ||
      !this.stateValue.currentSelectData.moduleId) {
      return false;
    }

    const _this = this;
    let dataCase = [...this.state.dataCase];
    let saveData = [];
    let type = Storage.local.get(top_current_project) ? Storage.local.get(top_current_project).type : null;
    dataCase.forEach(ci => {
      /**add by helj 根据产品项目不同赋值 开始 */
      if (type && type == "product") {

        var project = ci.pmsModuleId;
      } else {
        var project = ci.project;
      }
      /**add by helj 根据产品项目不同赋值 结束 */

      if (ci.caseDoUser
        && project === _this.stateValue.currentSelectData.projectId) {
        // && ci.module === _this.stateValue.currentSelectData.moduleId

        saveData.push({
          _id: ci._id,
          project: project,
          module: ci.module,
          childModuleName: ci.childModuleName,
          createUser: ci.createUser,
          createUserName: ci.createUserName,
          sort: ci.sort,
          caseRemark: ci.caseRemark,
          moduleName: ci.moduleName,
          caseTestResult: ci.caseTestResult,
          casePriority: ci.casePriority,
          caseExpectResult: ci.caseExpectResult,
          caseStepDesc: ci.caseStepDesc,
          caseStep: ci.caseStep,
          caseAudit: ci.caseAudit ? ci.caseAudit : '',
          casePremise: ci.casePremise,
          casePurpose: ci.casePurpose,
          caseDoUser: ci.caseDoUser,
          caseDoUsername: ci.caseDoUsername
        });
      }
    });

    if (saveData.length > 0) {

      if (_this.stateValue.currentSelectData.taskId && _this.stateValue.currentSelectData.taskId != 0) {
        //给三处插开始时间数据
        var updateBody = {};
        updateBody.id = null,
          updateBody.taskId = +_this.stateValue.currentSelectData.taskId,//taskId
          updateBody.round = +_this.stateValue.currentSelectData.times, //轮数
          updateBody.startTime = moment().format('YYYY/MM/DD'), //开始时间
          updateBody.endTime = "", //结束时间
          updateBody.isAPI = 0, //都为0
          updateBody.isPerformance = 0,//都为0
          updateBody.isSecurity = 0,//都为0
          updateBody.isStability = 0,//都为0
          updateBody.isFitness = 0,//都为0
          updateBody.riskEstimateSummary = null//默认空

        Ajax.post({
          url: API.UPDATE_QAM_TIMES,
          data: updateBody,
          success: (result) => {
            console.log('qam 右侧保存 执行插入开始时间成功');
          }
        });

      }

      Ajax.post({
        url: API.CASE_DO_SAVE_ALLOCATION_BY_VERSION,
        data: {
          version: _this.stateValue.currentSelectData.version,
          projectId: _this.stateValue.currentSelectData.projectId,
          projectName: _this.stateValue.currentSelectData.projectName,
          times: _this.stateValue.currentSelectData.times,
          env: _this.stateValue.currentSelectData.env,
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
              times: _this.stateValue.currentSelectData.times,
              version: _this.stateValue.currentSelectData.version,
              env: _this.stateValue.currentSelectData.env,
              projectName: _this.stateValue.currentSelectData.projectName,
              auditUsers: _this.stateValue.currentSelectData.auditUsers,
              users: _this.stateValue.currentSelectData.users,
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
   * 删除该用例执行任务
   */
  handleDeleteCaseDo() {
    const _this = this;
    Modal.confirm({
      title: '确定要删除当前用例执行任务【' + _this.state.selectModuleName + '】吗',
      onOk() {
        let option = {
          version: _this.stateValue.currentSelectData.version,
          projectId: _this.stateValue.currentSelectData.projectId,
          times: _this.stateValue.currentSelectData.times,
          env: _this.stateValue.currentSelectData.env,
          moduleId: _this.stateValue.currentSelectData.moduleId,
          type: Storage.local.get(top_current_project) ? Storage.local.get(top_current_project).type : null
        };

        Ajax.delete({
          url: API.CASE_DO_DELETE,
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
                times: _this.stateValue.currentSelectData.times,
                version: _this.stateValue.currentSelectData.version,
                env: _this.stateValue.currentSelectData.env,
                projectName: _this.stateValue.currentSelectData.projectName,
                auditUsers: _this.stateValue.currentSelectData.auditUsers,
                users: _this.stateValue.currentSelectData.users,
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
  onEnvSwitchChange(checked) {
    this.setState({
      doenvDisabled: !checked
    })
  },
  //更改优先级选项
  onCheckboxChange(checkedValues) {
    this.setState({
      checkedValues: checkedValues,
      filterName: checkedValues
    })
  },
  handleChange(pagination, filters, sorter) {
    this.setState({
      filteredInfo: filters
    });
  },
  //选择项目时获取门户版本信息
  onProjectSelect(value, label, extra) {
    let _this = this;
    Ajax.get({
      url: API.GET_QAM_VERSION,
      data: {
        projectId: value,
        type: Storage.local.get(top_current_project) ? Storage.local.get(top_current_project).type : null
      },
      success(res) {
        var result = res.body;

        if (result.status == 200) {
          if (result.message) {
            message.info("当前项目未关联PMS", 2);
            _this.setState({
              ispmsProject: false,
              ispmsprojectfortimes: false,
              selectProjectId: value,
              doversionDisabled: false,
              dotimesDisabled: false
            });
          } else {
            _this.setState({
              ispmsProject: true,
              ispmsprojectfortimes: true,
              versionInfo: result.data,
              selectProjectId: value,
              doversionDisabled: false
            });
          }
        } else {
          message.error(result.message, 2);
          _this.setState({
            ispmsProject: false,
            ispmsprojectfortimes: false,
            selectProjectId: value,
            doversionDisabled: false,
            dotimesDisabled: false
          });
        }

      },
    });

    /*   做QA 开发配比 回填*/
    let data = (this.state.treeData[0].children && this.state.treeData[0].children.length > 0) ? this.state.treeData[0].children : [];
    for (var i = 0; i < data.length; i++) {
      let mayBeCp = data[i];
      if (mayBeCp && mayBeCp.id && mayBeCp.id == value) {
        _this.props.form.setFieldsValue({
          development: (mayBeCp.children && mayBeCp.children.length > 0) ? mayBeCp.children[0].development : '',
          test: (mayBeCp.children && mayBeCp.children.length > 0) ? mayBeCp.children[0].qa : ''
        });
        break;
      } else {
        _this.props.form.setFieldsValue({
          development: '',
          test: ''
        });
        continue;
      }
    };
    _this.props.form.setFieldsValue({
      dotimes: ' ',
      doversion: ''
    });
  },
  //选择项目和版本后，获取门户轮数信息
  onVersionSelect(value) {
    let _this = this;
    Ajax.get({
      url: API.GET_QAM_TIMES,
      data: {
        projectId: _this.state.selectProjectId,
        version: value,
        type: Storage.local.get(top_current_project) ? Storage.local.get(top_current_project).type : null,
      },
      success(res) {
        var result = res.body;
        let roundInfo = [];

        //获取计划轮数
        for (var re of result.data.rounds) {
          if (re.round != 0 && re.round != -1 && re.round != -2) {
            let isallf = false;
            for (var i = 0; i < roundInfo.length; i++) {
              if (roundInfo[i].round == re.round) {
                isallf = true;
                break;
              } else {
                isallf = false;
              }
            }
            if (isallf == false) {
              roundInfo.push(re);
            }

          }
        }

        //获取实际轮数中计划没有的轮数（避免重复）
        for (var realR of result.data.realRounds) {
          if (realR.round != 0 && realR.round != -1 && realR.round != -2) {
            let isallf = true;
            for (var i = 0; i < roundInfo.length; i++) {
              if (roundInfo[i].round == realR.round) {
                isallf = true;
                break;
              } else {
                isallf = false;
              }
            }

            if (isallf == false) {
              roundInfo.push(realR);
            }

          }
        }


        _this.setState({
          dotimesInfo: roundInfo,
          dotimesDisabled: false,
          selectVersion: value,
          QAM_taskId: result.data.taskId
        });
      }
    });
    _this.props.form.setFieldsValue({
      dotimes: '',
    });
  },
  //轮数改变时
  onDotimesChange(value) {
    let _this = this;

    if (/^[0-9]$/g.exec(+value)) {
      if (+value == 0) {

      } else {
        _this.props.form.setFieldsValue({
          dotimes: +value,
        });
      }

    } else {
      _this.props.form.setFieldsValue({
        dotimes: 1,
      });
    }
  },
  render() {
    let {filteredInfo} = this.state;
    filteredInfo = filteredInfo || {};
    const selectModuleId = this.selectModuleId;
    const columnsModule = [{
      title: '模块名称',
      dataIndex: 'moduleName',
      render: function (o, row, index) {
        const tag = row.hasDo ? (<Tag color="green">已分配</Tag>) : '';
        if (selectModuleId && row._id === selectModuleId) {
          return (<strong style={{ color: '#2db7f5' }}>○ {o} {tag}</strong>);
        } else {
          return (
            <span>○ {o} {tag}</span>
          );
        }
      }
    }];

    let columnsCase = [{
      title: '执行人',
      dataIndex: 'caseDoUser',
      width: 180,
      className: "tdAlignCenter",
      render: this.renderCaseDoUser
    }, {
      title: '执行结果',
      className: "tdAlignCenter",
      dataIndex: 'caseTestResult',
      width: 80,
      render(text) {
        if (text === '不通过') {
          return (<span style={{ color: 'gray' }}>{text}</span>);
        } else if (text === '阻塞') {
          return (<span style={{ color: 'red' }}>{text}</span>);
        } else {
          return (<span style={{ color: 'green' }}>{text}</span>);
        }
      }
    }];
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
            {loop(item.children)}
          </TreeNode>
        );
      }

      return <TreeNode key={item.id} title={item.name} nodeData={item} expanded={true} isLeaf={true} />;
    });

    const loopTreeSelect = data => data.map((item) => {
      if (item.children && item.children.length > 0) {
        return (
          <TreeNode key={item.id} title={item.name} disabled={item.type !== 'project'} nodeData={item} value={item.id} expanded={true} >
            {loopTreeSelect(item.children)}
          </TreeNode>
        );
      }

      return <TreeNode key={item.id} disabled={item.type !== 'project'} title={item.name} nodeData={item} expanded={true} value={item.id} />;
    });

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
      ],
    });

    const doprojectProps = getFieldProps('doproject', {
      rules: [
        { required: true, message: '项目必选' }
      ],
    });
    const developmentProps = getFieldProps('development', {
      rules: [
        { required: true, type: 'number', message: '开发人数必填' }
      ],
    });
    const testProps = getFieldProps('test', {
      rules: [
        { required: true, type: 'number', message: '测试人数必填' }
      ],
    });
    const userSelectProps = getFieldProps('userSelect', {
      rules: [
        { required: true, message: '用例执行人必填' }
      ],
    });
    const userSelectSetProps = getFieldProps('userSelectSet', {
      rules: [
        { required: false }
      ],
    });
    const envProps = getFieldProps('doenv', {
      rules: [
        { required: false }
      ],
    });

    const startDateProps = getFieldProps('startDate', {
      rules: [
        { required: false, type: 'date' }
      ],
    });
    const endDateProps = getFieldProps('endDate', {
      rules: [
        { required: false, type: 'date' }
      ],
    });
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: this.onSelectChange,
      getCheckboxProps(record) {
        return {
          disabled: !!record.caseTestResult
        }
      }
    };
    const moduleRowSelection = {
      selectedRowKeys: this.state.moduleSelectedRowKeys,
      onChange: this.onModuleSelectChange,
      getCheckboxProps(record) {
        return {
          disabled: record.hasDo
        }
      }
    };
    const popoverContent = (
      <div>
        <UserSelect {...userSelectSetProps} data={this.state.userSelectData} style={{ width: 180 }} onSelect={this.mulitSetMulitCaseDoUser} />
      </div>
    );
    const leftDisplay = { display: this.state.leftDisplay ? '' : 'none' };
    const splitLeft = { left: this.state.leftDisplay ? 445 : 0 };
    const rightMarginLeft = { marginLeft: this.state.leftDisplay ? 460 : 15 };
    const isDisplay = { display: this.state.isDisplay ? 'none' : '' };

    const selectedModules = this.state.dataModule.map(item => {
      if (this.state.moduleSelectedRowKeys.indexOf(item._id) >= 0) {
        return (<li key={item._id}><strong>○ {item.moduleName}</strong></li>);
      }
    });
    const plainOptions = [
      { label: '高', value: '高' },
      { label: '中', value: '中' },
      { label: '低', value: '低' },
    ];
    const selectAlignCenter = (

      <div style={{ marginLeft: 100, marginTop: -25, display: this.state.CheckboxVisible }}>
        <CheckboxGroup style={{ marginLeft: 120 }} options={plainOptions} value={this.state.checkedValues} onChange={this.onCheckboxChange} >
        </CheckboxGroup>
      </div>

    );
    //加载版本信息
    let versionOptions = '';
    versionOptions = this.state.versionInfo ? this.state.versionInfo.map(item =>
      <Option key={item.versionId} value={item.versionName}>
        {item.versionName}
      </Option>
    ) : <Option value="无">无</Option>;
    //判断是否关联pms，true没有编写权限，false有编写权限
    let ispmsProject = '';
    ispmsProject = this.state.ispmsProject ? (
      <Select combobox
        {...doversionProps}
        onSelect={this.onVersionSelect}
        //disabled={this.state.doversionDisabled} //门户规则未推广，暂时先开启可以手动输入
        >

        {versionOptions}

      </Select>) : (<Select combobox
        {...doversionProps}
        //disabled={this.state.doversionDisabled}
        >

      </Select>);

    //加载轮数信息
    let dotimesOptions = '';
    dotimesOptions = this.state.dotimesInfo ? this.state.dotimesInfo.map(item =>
      <Option key={item.id} value={item.round}>
        {item.round}
      </Option>
    ) : <Option value="无">无</Option>;
    //轮数下拉框
    let ispmsprojectfortimes = '';
    ispmsprojectfortimes = (<Select combobox
      {...dotimesProps}
      //disabled={this.state.dotimesDisabled} //门户规则未推广，暂时先开启可以手动输入
      onChange={this.onDotimesChange} >
      <OptGroup label='轮数'>
        {dotimesOptions}
      </OptGroup>
    </Select>);
    return (
      <div>
        <Modal confirmLoading={this.state.confirmModuleLoading} maskClosable={false} title="按模块批量设置执行人" visible={this.state.modalModleVisible}
          onOk={this.handleModuleOk} onCancel={this.handleModuleCancel}>
          <div className="caseDistributionAllForm">
            <Form horizontal form={this.props.form}>
              <FormItem
                label="选择执行人：">
                <UserSelect {...userSelectProps} data={this.state.userSelectData} style={{ width: 180 }} />
              </FormItem>
              <FormItem label="筛选用例优先级：">
                {selectAlignCenter}
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
              <FormItem label="项目：" labelCol={{ span: 5 }}
                wrapperCol={{ span: 15 }}>
                <TreeSelect {...doprojectProps}
                  treeDefaultExpandAll={true}
                  onSelect={this.onProjectSelect}
                  dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                  style={{}}
                  allowClear>
                  {/*{loopTreeSelect(this.state.treeData) }*/}
                  {loopTreeSelect(this.state.selectData)}
                </TreeSelect>
              </FormItem>
              <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }}
                label="版本：">
                {ispmsProject}
              </FormItem>
              <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }}
                label="轮数：">
                {ispmsprojectfortimes}
              </FormItem>


              <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }}
                label="环境：">
                <Input {...envProps} />
              </FormItem>
              <FormItem label="计划开始时间：" labelCol={{ span: 5 }} wrapperCol={{ span: 15 }}>
                <DatePicker showTime format="yyyy-MM-dd HH:mm:ss" style={{width:305}}  {...startDateProps} />
              </FormItem>
              <FormItem label="计划结束时间：" labelCol={{ span: 5 }} wrapperCol={{ span: 15 }}>
                <DatePicker showTime format="yyyy-MM-dd HH:mm:ss" style={{width:305}}   {...endDateProps} />
              </FormItem>
              <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 18 }}
                label="开发测试配比："  >
                <InputNumber {...developmentProps} style={{ width: 140 }} min={0} max={100} />
                <span> - &nbsp;</span>
                <InputNumber {...testProps} style={{ width: 140 }} min={0} max={100} />eg:8:2
              </FormItem>

            </Form>
          </div>
        </Modal>
        {/*<div className="case-do-v-operate">
          <Button type="primary" onClick={this.handleAddVersionInfo}><Icon type="plus" /> 新增任务</Button>
        </div>*/}
        <div className="case-do-v-content">
          <div className="case-do-v-left" style={leftDisplay}>
            <h2>项目列表
                 <Button type="primary" style={{marginTop:3,float:'right'}} size='small' onClick={this.handleAddVersionInfo}><Icon type="plus" /> 新增任务</Button>
            </h2>
            <div className="case-tree">
              <ProjectVersionTimesTree
                treeDataLoading={this.state.treeDataLoading}
                treeData={this.state.treeData}
                onProjectSelect={this.onProSelect}
                expandedKeys={this.state.expandedKeys}
                autoExpandParent={this.state.autoExpandParent}
                onSelect={this.onSelect}
                onExpand={this.onExpand}
                onRightClick={this.onRightClick}>

              </ProjectVersionTimesTree>
            </div>
          </div>
          <div className="case-do-v-middle" style={leftDisplay}>
            <h2>（{this.state.selectProjectName}）模块列表</h2>

            <div className="case-do-v-container">
              <div className="case-do-v-bar">
                <Button type="primary" disabled={!(this.state.moduleSelectedRowKeys.length > 0)} onClick={this.handleModalModleShow}><Icon type="save" /> 按模块批量设置执行人</Button>
              </div>
              <div style={isDisplay}>
                <Alert message="请选择至轮数节点查看模块列表" type="warning" />
              </div>
              <div className="case-do-module-select">
                <Table bordered columns={columnsModule} size="middle"
                  rowKey={record => record._id}
                  rowSelection={moduleRowSelection}
                  onRowClick={this.onRowClick}
                  loading={this.state.tableModuleLoading}
                  pagination={this.state.paginationModule}
                  dataSource={this.state.tableDataModule}
                  />
              </div>
            </div>
          </div>
          <Tooltip placement={this.state.leftDisplay ? 'left' : 'right'} title='显示/隐藏左边'><div className="case-do-v-split" style={splitLeft} onClick={this.handelSplitClick}>{this.state.leftDisplay ? '◀' : '▶'}</div></Tooltip>
          <div className="case-do-v-right" style={rightMarginLeft}>
            <h2>（{this.state.selectModuleName}）模块用例列表</h2>
            <div className="case-do-v-container">
              <div className="case-do-v-bar">
                <Button type="primary" disabled={this.state.saveCaseDoDisabled} loading={this.state.saveLoading} onClick={this.handleSaveCaseDo} ><Icon type="save" /> 保存用例执行任务</Button>

                <Popover content={popoverContent} title="设置执行人" trigger="click" placement="bottomLeft"
                  visible={this.state.popVisible} onVisibleChange={this.handlePopVisibleChange}>
                  <Button style={{ marginLeft: 10 }} type="ghost" disabled={!(this.state.selectedRowKeys.length > 0)}>批量设置执行人</Button>
                </Popover>

                <span style={{ float: 'right' }}>
                  <Button type="dashed" disabled={this.state.deleteCaseDoDisabled} loading={this.state.deleteLoading} onClick={this.handleDeleteCaseDo}>删除该用例执行任务</Button>
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
                  scroll={{ y: 500 }} />
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
