import './style.less';
import React from 'react';
import reqwest from 'reqwest';
import { Link } from 'react-router';
import { Breadcrumb, Row, Col, Switch, Popconfirm, Table, message, Modal, Input, InputNumber, Checkbox, Form, Button, Icon, Tooltip, Tag, Menu, Dropdown } from 'antd';
import Page from '../../framework/page/Page';
import API from '../API';
import UserComboSelect from './UserComboSelect';
import Storage from '../../framework/common/storage';
import Funs from '../../framework/common/functions';
import SearchInput from '../ctrl/SearchInput';
import ProjectSelect from '../case_do/ProjectSelect';
import PubSubMsg from '../../framework/common/pubsubmsg';

const CheckboxGroup = Checkbox.Group;
const FormItem = Form.Item;
const createForm = Form.create;
const top_current_project = Funs.top_current_project + '_' + _USERINFO.userId;

// let currentRow;
let Project = React.createClass({
  stateValue: {},
  currentRow: {},
  fetchParam: {},
  getInitialState() {
    return {
      data: [],
      // versionShow: {},
      chooseUserShow: {},
      contactPmsShow: {},
      expandedRowID: '',
      defaultExpandedRowKeys: [],
      tableLoading: true,
      isInputDisabled: false,
      loading: true,
      keyword: '',
      expandedRows: '',
      modalVisible: false,
      modalSynVisible: false,
      confirmLoading: false,
      modalTitle: '添加项目',
      pmsProjectData: [],
      updateInfo:[],
      createInfo:[],
      pagination: {
        pageSize: 10
      },
      modeDisabled: true,//审核模式是否可编辑
      informDisabled: true,//是否抄送通知      
    };
  },
  componentWillUnmount() {
    PubSubMsg.unsubscribe('get_current_project');
  },
  componentDidMount() {
    let _this = this;
    this.setState({ loading: false });
    PubSubMsg.subscribe('get_current_project', function (resData) {
      _this.fetch();//加载项目及子项目
      _this.fetchConfig();//加载项目配置信息
    });
    this.fetch();//加载项目及子项目
    this.fetchConfig();//加载项目配置信息
  },
  fetch(params = {}, showLoading = true, isExpanded = false) {
    const _this = this;
    if (showLoading) {
      this.setState({ tableLoading: true });
    }
    Storage.local.get(top_current_project) ? params._id = Funs.decrypt(Storage.local.get(top_current_project).currentProject, Funs.secret) : params._id = null;
    Storage.local.get(top_current_project) ? params.type = Storage.local.get(top_current_project).type : params.type = null;

    reqwest({
      url: API.PROJECT_MANAGE,
      method: 'get',
      data: params,
      type: 'json',
      success: (result) => {
        _this.setState({
          modalVisible: false,
        })
        const pagination = this.state.pagination;
        pagination.total = result.totalCount;
        let defaultExpandedRowKeys = [];
        const tempRowKeys = [];
        if (isExpanded) {
          result.data.forEach(item => {
            tempRowKeys.push(item._id);
          });
          tempRowKeys.push(_this.currentRow.project);
          defaultExpandedRowKeys = tempRowKeys.concat(result.expandedRowKey);
        } else {
          result.data.forEach(item => {
            if (item.children) {
              if (item.children.length > 0) {
                for (var chi of item.children) {
                  defaultExpandedRowKeys.push(chi._id);
                }
              }
            }
            defaultExpandedRowKeys.push(item._id);
          });
          defaultExpandedRowKeys.push(this.state.expandedRowID);
        }

        _this.setState({
          tableLoading: false,
          data: result.data,
          defaultExpandedRowKeys: defaultExpandedRowKeys,
          pagination
        });
      }
    });
  },
  //刷新项目配置数据
  fetchConfig(params = {}) {
    const _this = this;
    Storage.local.get(top_current_project) ? params._id = Funs.decrypt(Storage.local.get(top_current_project).currentProject, Funs.secret) : params._id = null;
    Storage.local.get(top_current_project) ? params.type = Storage.local.get(top_current_project).type : params.type = null;
    reqwest({
      url: API.PROJECT_CONFIG,
      method: 'get',
      data: params,
      type: 'json',
      success: (result) => {
        if (result.status == 200) {
          var isModeDisabled;
          if (result.data[0].AuditMode == 2) {
            isModeDisabled = false;
          } else {
            isModeDisabled = true;
          }
          _this.setState({
            modeDisabled: isModeDisabled,
            informDisabled: result.data[0].isInform ? false : true,

          });
        } else {
          _this.setState({
            modeDisabled: true,
            informDisabled: true,

          });

        }

      }

    });
  },
  handleTableChange(pagination, filters, sorter) {
    let _this = this;
    const pager = this.state.pagination;
    pager.current = pagination.current;
    this.setState({
      pagination: pager,
      tableLoading: false
    });
    _this.fetchParam.limit = pagination.pageSize;
    _this.fetchParam.currentPage = pagination.current;

    this.fetch({
      pageSize: pagination.pageSize,
      currentPage: pagination.current,
      sortField: sorter.field,
      sortOrder: sorter.order,
      keyword: this.state.keyword
    }, false);


  },
  // 新增项目添加项目
  createProjectModal(row) {
    const _this = this;
    _this.currentRow = row;
    if (row._id) { // 增加下级项目
      _this.currentRow.action = 'childProject_add';
      _this.props.form.setFieldsValue({
        projectName: '',
        projectRemark: row.projectDesc,
        // version: row.version,
        sort: 0
      });


      reqwest({  // 获取PMS下拉项目
        url: API.PMS_PROJECT_LIST,
        method: 'get',
        contentType: 'application/json',
        data: null,
        type: 'json',
        success: (result) => {
          _this.setState({
            pmsProjectData: result.pmsProject
          });
        }
      });


      _this.setState({
        modalVisible: true,
        modalTitle: '新增子项目',
        chooseUserShow: { display: 'none' },
        // versionShow: { display: '' }
        contactPmsShow: { display: '' }
      });
    } else { // 新增项目
      // _this.props.form.resetFields();
      _this.currentRow.action = 'project_add';
      _this.props.form.setFieldsValue({
        projectName: '',
        usersName: [_USERINFO.userId],
        browseUsersName: [],
        auditUsersName: [],
        projectRemark: '',
        pmsSelect: [],
        // version: '',
        sort: 0
      });

      reqwest({   // 获取最大排序
        url: API.MAX_SORT,
        method: 'post',
        contentType: 'application/json',
        data: null,
        type: 'json',
        success: (result) => {
          _this.props.form.setFieldsValue({
            sort: result.data
          });
        }
      });

      reqwest({  // 获取PMS下拉项目
        url: API.PMS_PROJECT_LIST,
        method: 'get',
        contentType: 'application/json',
        data: null,
        type: 'json',
        success: (result) => {
          _this.setState({
            pmsProjectData: result.pmsProject
          });
        }
      });

      _this.setState({
        modalTitle: '新增项目',
        modalVisible: true,
        chooseUserShow: { display: 'none' },
        // versionShow: { display: '' }
        contactPmsShow: { display: '' }
      });
    }
  },
  createSynModal(){
    let params  =  {};
    const _this = this;
    Storage.local.get(top_current_project) ? params._id = Funs.decrypt(Storage.local.get(top_current_project).currentProject, Funs.secret) : params._id = null;
    Storage.local.get(top_current_project) ? params.type = Storage.local.get(top_current_project).type : params.type = null;
    reqwest({
        url: API.PMS_PROJECT_SYNINFO,
        method: 'get',
        data: params,
        type: 'json',
        success: (result) => {
          _this.setState({
            updateInfo: result.updateInfo,
            createInfo: result.createInfo
          });
        }
      });
    _this.setState({
      modalSynVisible: true
    });
  },
  // //新增模块
  createModuleModal(row) {
    const _this = this;
    _this.currentRow = row;
    _this.currentRow.action = 'module_add';
    _this.props.form.setFieldsValue({
      projectName: '',
      projectRemark: row.projectDesc,
      sort: 0
    });

    if (row.rowType == 'module') {
      _this.setState({
        modalVisible: true,
        modalTitle: '新增子模块',
        // versionShow: { display: 'none' },
        chooseUserShow: { display: 'none' },
        contactPmsShow: { display: 'none' }
      });
    } else {
      _this.setState({
        modalVisible: true,
        modalTitle: '新增模块',
        // versionShow: { display: 'none' },
        chooseUserShow: { display: 'none' },
        contactPmsShow: { display: 'none' }
      });

    }

  },
  // 编辑
  editModal(row) {

    const _this = this;
    _this.currentRow = row;
    _this.props.form.setFieldsValue({
      projectName: row.projectName,
      usersName: row.users,
      browseUsersName: row.browseUsers,
      auditUsersName: row.auditUsers,
      projectRemark: row.projectDesc,
      pmsSelect: row.pmsProject,
      // version: row.version,
      sort: row.sort
    });

    if (row.rowType === 'project') {
      _this.currentRow.action = 'project_edit';

      reqwest({  // 获取PMS下拉项目
        url: API.PMS_PROJECT_LIST,
        method: 'get',
        contentType: 'application/json',
        data: null,
        type: 'json',
        success: (result) => {
          _this.setState({
            pmsProjectData: result.pmsProject
          });
        }
      });

      _this.setState({
        modalVisible: true,
        modalTitle: '编辑项目',
        // versionShow: { display: '' },
        chooseUserShow: { display: 'none' },
        contactPmsShow: { display: '' }
      });
    } else if (row.rowType === 'childProject') {
      _this.currentRow.action = 'childProject_edit';

      reqwest({  // 获取PMS下拉项目
        url: API.PMS_PROJECT_LIST,
        method: 'get',
        contentType: 'application/json',
        data: null,
        type: 'json',
        success: (result) => {
          _this.setState({
            pmsProjectData: result.pmsProject
          });
        }
      });

      _this.setState({
        modalVisible: true,
        modalTitle: '编辑子项目',
        // versionShow: { display: '' },
        chooseUserShow: { display: 'none' },
        contactPmsShow: { display: '' }
      });
    } else {
      _this.currentRow.action = 'module_edit';
      _this.setState({
        modalVisible: true,
        modalTitle: '编辑',
        // versionShow: { display: 'none' },
        chooseUserShow: { display: 'none' },
        contactPmsShow: { display: 'none' }
      });
    }
  },
  deleteModal(row) {
    const _this = this;
    let content, title;
    if (row.rowType === 'module') {
      _this.state.expandedRowID = row.project;
      title = '您是否确认要删除【' + row.projectName + "】模块？"
      content = <div style={{ color: "red", fontWeight: "bold" }}>请慎重！！！<br />删除模块会一并删除子模块以及用例。</div>;
    } else {
      title = '您是否确认要删除【' + row.projectName + "】项目？"
      content = <div style={{ color: "red", fontWeight: "bold" }}>请慎重！！！<br />删除项目会一并删除子项目、模块以及用例。</div>;
    }
    Modal.confirm({
      title: title,
      content: content,
      okText: '取消',
      cancelText: '确定',
      onOk() {
        message.error('取消删除');
      },
      onCancel() {
        reqwest({
          url: API.PROJECT_DELETE,
          method: 'delete',
          contentType: 'application/json',
          data: JSON.stringify({
            id: row._id,
            type: row.rowType
          }),
          type: 'json',
          success: (result) => {
            if (row.rowType === 'project') {
              PubSubMsg.publish('project-del-update', {});
            }
            _this.fetch({ keyword: _this.state.keyword, expandedRows: result.data }, true, true);
          }
        });
        message.success('成功删除');
      },
    });
  },
  // 删除功能
  // antdConfirm(row) {
  //   this.deleteAction(row);
  //   message.success('成功删除');
  // },

  // antdCancel() {
  //   message.error('取消删除');
  // },
  showSuccessMessage() {
    message.success('成功完成');
  },
  showFailMessage() {
    message.error('事件失败');
  },
  // deleteAction(row) {
  //   const _this = this;
  //   if (row.rowType === 'module') {
  //     _this.state.expandedRowID = row.project;
  //   }
  //   reqwest({
  //     url: API.PROJECT_DELETE,
  //     method: 'delete',
  //     contentType: 'application/json',
  //     data: JSON.stringify({
  //       id: row._id,
  //       type: row.rowType
  //     }),
  //     type: 'json',
  //     success: (result) => {
  //       _this.fetch({ keyword: this.state.keyword }, true, true);
  //       // _this.setState({
  //       //   modalVisible: false,
  //       //   tableLoading: false
  //       // });
  //     }
  //   });
  // },

  // Modal 保存
  handleOk() {
    const _this = this;
    const action = _this.currentRow.action;
    let url = '';
    let method = '';
    let expandedRowsId = "";
    if (_this.props.form.getFieldValue('pmsSelect') && _this.props.form.getFieldValue('pmsSelect').length > 0) {
      // pms模态关连封装ID NAME
      let pmsProject = {};
      let pmsSelectValue = _this.props.form.getFieldValue('pmsSelect');
      let index = pmsSelectValue.lastIndexOf('--');
      if (index !== -1) {
        pmsProject.name = pmsSelectValue.substring(0, index);
        pmsProject.id = pmsSelectValue.substring(index + 2, pmsSelectValue.length);
        _this.stateValue.pmsProject = pmsProject;
      } else {
        // to do
      }
    }

    _this.stateValue.projectName = _this.props.form.getFieldValue('projectName');
    // _this.stateValue.version = _this.props.form.getFieldValue('version');
    _this.stateValue.sort = _this.props.form.getFieldValue('sort');
    _this.stateValue.projectDesc = _this.props.form.getFieldValue('projectRemark');
    _this.stateValue.users = _this.props.form.getFieldValue('usersName');
    _this.stateValue.auditUsers = _this.props.form.getFieldValue('auditUsersName');
    _this.stateValue.browseUsers = _this.props.form.getFieldValue('browseUsersName');

    if (action === 'project_add') {  // 执行 添加项目
      _this.stateValue.rowType = 'project';
      _this.stateValue.parentId = '';

      url = API.PROJECT_POST;
      method = 'post';

      _this.setState({
        keyword: ''
      });
    } else if (action === 'childProject_add') {   // 新增下级项目
      _this.stateValue.rowType = 'childProject';
      _this.stateValue.parentId = _this.currentRow.project;

      url = API.PROJECT_POST;
      method = 'post';
    } else if (action === 'module_add') {
      _this.state.expandedRowID = _this.currentRow._id;
      if (_this.currentRow.rowType == 'module') {
        _this.stateValue.parentId = _this.currentRow._id
      } else {
        _this.stateValue.parentId = null;
      }
      _this.state.expandedRows = _this.currentRow._id;
      expandedRowsId = _this.currentRow._id;
      _this.stateValue.rowType = 'module';
      //_this.stateValue.parentId = '';
      _this.stateValue.moduleName = _this.props.form.getFieldValue('projectName');
      _this.stateValue.moduleDesc = _this.props.form.getFieldValue('projectRemark');
      _this.stateValue._id = '';
      _this.stateValue.project = _this.currentRow.project;

      url = API.PROJECT_MODULE_PUT;
      method = 'put';
    } else if (action === 'project_edit') {
      _this.state.expandedRowID = _this.currentRow._id;

      _this.stateValue.rowType = 'project';
      _this.stateValue.parentId = '';
      _this.stateValue._id = _this.currentRow._id;
      _this.stateValue.project = _this.currentRow.project;

      url = API.PROJECT_PUT;
      method = 'put';
    } else if (action === 'childProject_edit') {
      _this.state.expandedRowID = _this.currentRow._id;

      _this.stateValue.rowType = 'childProject';
      _this.stateValue.parentId = '';
      _this.stateValue._id = _this.currentRow._id;
      _this.stateValue.project = _this.currentRow.project;

      url = API.PROJECT_PUT;
      method = 'put';
    } else if (action === 'module_edit') {
      _this.state.expandedRowID = _this.currentRow.project;

      _this.stateValue.rowType = 'module';
      //_this.stateValue.parentId = '';
      _this.stateValue._id = _this.currentRow._id;
      expandedRowsId = _this.currentRow._id;
      _this.stateValue.project = _this.currentRow.project;
      _this.stateValue.moduleName = _this.props.form.getFieldValue('projectName');
      _this.stateValue.moduleDesc = _this.props.form.getFieldValue('projectRemark');

      url = API.PROJECT_MODULE_POST;
      method = 'post';
    } else {
      // to do
    }

    // 提交表单函数
    function formSumbit() {
      reqwest({
        url: url,
        method: method,
        contentType: 'application/json',
        data: JSON.stringify(_this.stateValue),
        type: 'json',
        success: (result) => {
          _this.stateValue = {};
          _this.fetchParam.keyword = _this.state.keyword;
          _this.fetchParam.expandedRows = expandedRowsId;
          // _this.fetch({ keyword: _this.state.keyword, expandedRows: expandedRowsId, limit: 1000 }, true, true);
          _this.fetch(_this.fetchParam, true, true);
          // _this.setState({
          //   modalVisible: false,
          //   tableLoading: false
          // });
          _this.showSuccessMessage();
          //若为添加项目，刷新导航显示
          if (action === 'project_add') {
            //添加消息，刷新导航项目
            PubSubMsg.publish('project-add-update', {});

            // header.loadTreeSelect();
          }
        }
      });
    }

    // 表单校验
    _this.props.form.validateFields((errors, values) => {
      if (!!errors) {
        if (errors.projectName) {
          return;
        } else if (errors.usersName && _this.stateValue.rowType === 'project') {
          return;
        } else {
          formSumbit();
        }
      } else {
        formSumbit();
      }
    });
  },
  handleSynOk(){
    let params  =  {};
    const _this = this;
    Storage.local.get(top_current_project) ? params._id = Funs.decrypt(Storage.local.get(top_current_project).currentProject, Funs.secret) : params._id = null;
    Storage.local.get(top_current_project) ? params.type = Storage.local.get(top_current_project).type : params.type = null;
    reqwest({
        url: API.PMS_PROJECT_SYN,
        method: 'get',
        data: params,
        type: 'json',
        success: (result) => {
          _this.setState({
              updateInfo: [],
              createInfo: [],
              modalSynVisible: false
          });
          _this.fetch();
          message.success('成功同步');
        }
    });

  },
  // Modal 取消
  handleCancel(e) {
    this.setState({
      modalVisible: false
    });
  },
// Modal 取消
  handleSynCancel(e) {
    this.setState({
      modalSynVisible: false
    });
  },
  // 搜索
  onExpanded(expanded, record) {
    let keys = [...this.state.defaultExpandedRowKeys];
    if (expanded) {
      keys.push(record._id);
    } else {
      let index = keys.indexOf(record._id);

      if (index > -1) {
        keys.splice(index, 1);
      }
    }
    this.setState({
      defaultExpandedRowKeys: keys
    });
  },
  keywordSearch(w) {
    const _this = this;
    this.state.pagination.current = 1;
    _this.setState({
      keyword: w
    });
    _this.fetch({ keyword: w });
  },

  // 版本显示
  // versionOptFun(o, row) {
  //   var text = o;
  //   if (text) {
  //     var index = text.lastIndexOf(',');
  //     if (index > 0) {
  //       var newVersion = text.substring(index + 1, text.length);
  //       var newVersionStr = '最新版本:' + newVersion;
  //       var wholeVersionStr = '完整版本:' + text;
  //       return (
  //         <div>
  //           <span>{newVersion}</span>
  //           <Tooltip title={(<span>{newVersionStr}<br/>{wholeVersionStr}</span>) }>
  //             <span>[更多]</span>
  //           </Tooltip>
  //         </div>
  //       );
  //     } else {
  //       return (
  //         <span>{text}</span>
  //       );
  //     }

  //   }
  // },
  // 添加操作按钮

  // pmsSelect 控制名称
  onPmsSelect(val, option) {
    const _this = this;
    let pmsIndex = val.lastIndexOf('--');
    let pmsProjectName = val.substring(0, pmsIndex);
    let pmsProjectId = val.substring(pmsIndex + 2, val.length);
    if (pmsProjectId > 0 && pmsProjectName !== '无') {
      _this.props.form.setFieldsValue({
        projectName: pmsProjectName
      });
      // this.setState({
      //   isInputDisabled: true
      // });
    } else {
      _this.props.form.setFieldsValue({
        projectName: ''
      });
      // this.setState({
      //   isInputDisabled: false
      // });
    }
  },
  projectOptFun(o, row, index) {
    // 做项目编辑和删除的权限
    let disabledAttr = '';   // refuse 按钮失效 ''按钮不失效
    let auth = _USERINFO.auth;
    let userId = _USERINFO.userId;
    for (let i = 0; i < auth.length; i++) {
      if (auth[i].oper_href === '/client/project/refuse/update&delete') {
        if (row.browseUsers.indexOf(userId) > -1) {
          disabledAttr = 'refuse';
          break;
        }
      } else {
        disabledAttr = '';
      }
    }
    var proTypt = Storage.local.get(top_current_project) ? Storage.local.get(top_current_project).type : null;

    // gyt 根据导航选择的产品/项目做不同的操作显示 
    if (proTypt && proTypt == 'project') {
      if (row.rowType === 'project') {
        return (
          <div>
            <a onClick={this.createProjectModal.bind(this, row)}>
              <Icon type='circle-o-down' />
              新增子项目
            </a>

            <Link to={"/projectAuth"}>
              <Icon type="retweet" />
              成员设置
            </Link>
            <a style={{ color: "#666666" }} disabled={disabledAttr} onClick={this.editModal.bind(this, row)}>
              <Icon type='edit' />
              编辑
            </a>
            <a style={{ color: "#666666" }} disabled={disabledAttr} className='deleteOpt' onClick={this.deleteModal.bind(this, row)}>
              <Icon type='delete' />
              删除
            </a >

          </div>

        );
      } else if (row.rowType === 'childProject') {
        return (
          <div>
            <Link to={"/projectModule"}>
              <Icon type="retweet" />
              模块管理
            </Link>
            <a disabled={disabledAttr} style={{ color: "#666666" }} onClick={this.editModal.bind(this, row)}>
              <Icon type='edit' />
              编辑
            </a>

            <a disabled={disabledAttr} style={{ color: "#666666" }} className='deleteOpt' onClick={this.deleteModal.bind(this, row)}>
              <Icon type='delete' />
              删除
            </a >

          </div>
        );
      } else {
        return (
          <div>
            <a style={{ color: "#666666" }} onClick={this.createModuleModal.bind(this, row)}>
              <Icon type='plus-circle-o' />
              新增子模块
          </a>
            <a disabled={disabledAttr} style={{ color: "#666666" }} onClick={this.editModal.bind(this, row)}>
              <Icon type='edit' />
              编辑
          </a>
            <a style={{ color: "#666666" }} disabled={disabledAttr} className='deleteOpt' onClick={this.deleteModal.bind(this, row)}>
              <Icon type='delete' />
              删除
          </a >
          </div>
        );
      }
    } else {
      if (row.rowType === 'product') {
        return (
          <Link to={"/projectAuth"}>
            <Icon type="retweet" />
            成员设置
          </Link>
        )
      } else if (row.rowType === 'childProject') {
        return (
          <div>
            <Link to={"/projectModule"}>
              <Icon type="retweet" />
              模块管理
          </Link>
          </div>
        )
      }
    }

  },
  projectNameOptFun(text, record, index) {
    if (record.rowType != "module") {
      return <font color="#2db7f5">{text}</font>
    } else {
      return <span>{text}</span>
    }
  },
  modeSwitchChange(checked) {
    this.setState({
      modeDisabled: !checked
    })
  },
  informSwitchChange(checked) {
    this.setState({
      informDisabled: !checked
    })
  },
  /**保存项目配置信息
   * 规则：1、审核模块是否可编辑AuditMode  true(可编辑)==1  false（不可编辑）==2
   *      2、是否抄送通知  isInform
   *  */
  saveConfigure() {
    let _this = this;
    var topProjectId = Storage.local.get(top_current_project) ? Funs.decrypt(Storage.local.get(top_current_project).currentProject, Funs.secret) : null;
    var proTypt = Storage.local.get(top_current_project) ? Storage.local.get(top_current_project).type : null;
    reqwest({
      url: API.PROJECT_CONFIG_ADD,
      method: 'post',
      data: {
        'projectId': topProjectId,
        'type': proTypt,
        'AuditMode': this.state.modeDisabled ? 1 : 2,
        'isInform': this.state.informDisabled ? false : true,
      },
      type: 'json',
      success: (result) => {
        if (result.status == 200) {
          message.success('保存成功');
        } else {
          message.success('保存失败');
        }

      }
    });
  },
  render() {
    const pageHeader =
      <div>
        <h1 className='admin-page-header-title'>项目管理</h1>
        <Breadcrumb>
          <Breadcrumb.Item>
            <Icon type="home" />
            首页
          </Breadcrumb.Item>
          <Breadcrumb.Item>项目管理</Breadcrumb.Item>
        </Breadcrumb>
      </div>;
    var proTypt = Storage.local.get(top_current_project) ? Storage.local.get(top_current_project).type : null;

    const columns = [{
      title: '项目名称【同步于PMS产品下模块名称】',
      dataIndex: 'projectName',
      width: "70%",
      render: this.projectNameOptFun
    }, {
      title: '排序',
      dataIndex: 'sort',
      width: "5%",
      className: 'sortClz'
    }, {
      title: '操作',
      dataIndex: 'opt',
      width: '25%',
      className: 'optClz',
      render: this.projectOptFun
    }];
    if (proTypt && proTypt == "project") {
      columns.splice(0, 1, {
        title: '项目名称',
        dataIndex: 'projectName',
        width: "30%",
        render: this.projectNameOptFun
      }, {
          title: '关联PMS中项目',
          dataIndex: 'pmsProject',
          width: "15%",
          render: function (o, row) {
            return row.rowType === 'project' ? o : (row.rowType === 'childProject' ? o : '');
          }
        }, {
          title: '项目描述',
          dataIndex: 'projectDesc',
          width: "20%"
        })
    }

    const { getFieldProps } = this.props.form;

    const projectNameProps = getFieldProps('projectName', {
      rules: [
        { required: true, message: '项目名称必填', type: 'string' }
      ]
    });
    const usersNameProps = getFieldProps('usersName', {
      rules: [
        { required: true, message: '关联QA人员必填', type: 'array' }
      ]
    });
    const auditUsersNameProps = getFieldProps('auditUsersName', {
      rules: [
        { required: false, message: '审核人员必填', type: 'array' }
      ]
    });
    const browseUsersNameProps = getFieldProps('browseUsersName', {
      rules: [
        { required: false, message: '浏览人员', type: 'array' }
      ]
    });
    const sortProps = getFieldProps('sort', {
      rules: [
        { required: false, message: '排序', type: 'number' }
      ]
    });
    const pmsProps = getFieldProps('pmsSelect', {
      rules: [
        { required: false, message: 'PMS项目勾选', type: 'string' }
      ]
    });
    // const versionProps = getFieldProps('version', {
    //   rules: [
    //     { required: false, message: '版本号必填(v或者V表示)', type: "string" }
    //   ],
    // });
    const projectRemarkProps = getFieldProps('projectRemark', {
      rules: [
        { required: false, message: '项目备注', type: 'string' }
      ]
    });

    let isCreateProject = '';
    if (proTypt && proTypt == "project") {
      isCreateProject = (<Button type='primary' className='btnClass' onClick={this.createProjectModal}>
        <Icon type='plus' />
        新增项目
        </Button>);
    }else if(proTypt && proTypt == "product"){
      isCreateProject = (<Button type='primary' className='btnClass' onClick={this.createSynModal}>
        <Icon type='cloud-upload-o' />
        同步PMS模块
        </Button>);
    }else{

    }
    //console.log(this.state.updateInfo)
    let pmsUpdateSynInfo = '';
    if(this.state.updateInfo && this.state.updateInfo.length > 0){
        for(var i = 0; i<this.state.updateInfo.length; i++){
          let item = this.state.updateInfo[i];
          pmsUpdateSynInfo += `【${item.moduleName}】`; // 排序${item.sort};
        }

    }else{
      pmsUpdateSynInfo  = '';
    }
    let pmsCreateSynInfo = '';
    if(this.state.createInfo && this.state.createInfo.length > 0){
        for(var i = 0; i<this.state.createInfo.length; i++){
          let item = this.state.createInfo[i];
          pmsCreateSynInfo += `【${item.moduleName}】`;//,排序${item.sort}.`;
        }

    }else{
      pmsCreateSynInfo = '';
    }
    return (
      <Page header={pageHeader} loading={this.state.loading}>

     {/*   <Form horizontal className="ant-advanced-search-form" style={{ marginTop: 10 }}>
          <Row gutter={16} style={{ marginTop: 20 }}>
            <Col sm={8}>
              <FormItem label="审核模式是否可编辑" labelCol={{ span: 20 }} wrapperCol={{ span: 4 }}>
                <Switch onChange={this.modeSwitchChange} checkedChildren={'是'} unCheckedChildren={'否'} checked={!this.state.modeDisabled} />
              </FormItem>
            </Col>
            <Col sm={8}>
              <FormItem label="模块审核完毕是否发送通知：" labelCol={{ span: 20 }} wrapperCol={{ span: 4 }}>
                <Switch onChange={this.informSwitchChange} checkedChildren={'是'} unCheckedChildren={'否'} checked={!this.state.informDisabled} />
              </FormItem>
            </Col>

            <Col sm={8}>
              <FormItem  >
                <Button type="primary" htmlType="submit" onClick={this.saveConfigure}>保存</Button>
              </FormItem>
            </Col>
          </Row>
        </Form>*/}
      
        <div className='project-bar'>
          {isCreateProject}
          {
            // <SearchInput style={{ width: 210 }} onSearch={this.keywordSearch} placeholder='输入搜索关键词' />
          }
        </div>
        <div className='project-bara'>
          <Table bordered columns={columns}
            rowKey={record => record._id}
            dataSource={this.state.data}
            expandedRowKeys={this.state.defaultExpandedRowKeys}
            onExpand={this.onExpanded}
            pagination={false}
            loading={this.state.tableLoading}
            onChange={this.handleTableChange}
            />

        </div>
        <Modal maskClosable={false} title={'同步PMS模块'} width={610} visible={this.state.modalSynVisible}
          onOk={this.handleSynOk} onCancel={this.handleSynCancel}>
            更新的模块:
            <span style={{color:'#03c',fontSize:13}}>
              {pmsUpdateSynInfo}
            </span>
            <br/>
            新增的模块:
            <span style={{color:'#03c',fontSize:13}}> 
              {pmsCreateSynInfo} 
            </span>
        </Modal>


        <Modal maskClosable={false} title={this.state.modalTitle} width={610} visible={this.state.modalVisible}
          onOk={this.handleOk} onCancel={this.handleCancel}>
          <div className="projectForm">
            <Form horizontal form={this.props.form}>
              <FormItem label='关联PMS(禅道)项目：' style={this.state.contactPmsShow} >
                <ProjectSelect {...pmsProps} data={this.state.pmsProjectData} onProjectSelect={this.onPmsSelect} router={'/client/project'}
                  style={{ width: 580 }} optGroupStyle={{ display: 'none' }} optGroupLabel={''} isAllowClear={false} />
              </FormItem>
              <FormItem label='名称：'>
                <Input {...projectNameProps} style={{ width: 580 }} disabled={this.state.isInputDisabled} />
              </FormItem>
              <FormItem label='关联QA人员：' style={this.state.chooseUserShow}>
                <UserComboSelect {...usersNameProps} />
              </FormItem>
              <FormItem label='用例审核人员：' style={this.state.chooseUserShow}>
                <UserComboSelect {...auditUsersNameProps} />
              </FormItem>
              <FormItem label='浏览人员：' style={this.state.chooseUserShow}>
                <UserComboSelect {...browseUsersNameProps} />
              </FormItem>
              <FormItem label='排序：'>
                <InputNumber {...sortProps} style={{ width: 580 }} min={0} max={111} />
              </FormItem>
              <FormItem label='描述：'>
                <textarea {...projectRemarkProps} style={{ maxWidth: 580, width: 580 }} />
              </FormItem>
            </Form>
          </div>
        </Modal>
      </Page>
    );
  }
});

Project = createForm()(Project);
export default Project;
