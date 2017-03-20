import './style.caseAudit.spreadsheet.less';
import React from 'react';
import { Tag, Switch, Alert, Table, Modal, Spin, Button, Icon, Upload, Pagination, Dropdown,Menu,message } from 'antd'
import reqwest from 'reqwest';
import PubSubMsg from '../../framework/common/pubsubmsg';
import 'handsontable.css';
import { default as Handsontable } from 'handsontable';
import FAIcon from '../../framework/faicon/FAIcon';
import ExcelPagination from '../../component/ExcelPagination';
import API from '../API';

import $ from '../../framework/common/jquery-2.1.1.min';
import * as _ from 'lodash';
import Storage from '../../framework/common/storage';
import Funs from '../../framework/common/functions';


const top_current_project = Funs.top_current_project +'_'+_USERINFO.userId;
const confirm = Modal.confirm;
const SD = '7',PM = '8';//T
const CaseAuditSpreadsheet = React.createClass({
  config: {
    customColumns: [],
    userConfig_unVisibleCol: [],
    userConfig_customColHeaders: [],
    userConfig_fixedColumnsLeft: [],
    colWidths: [],
    // contextMenuItem: {},
    defcolums: []
  },
  variable: {
    currentData: [],
    currentHasEditPermissions: false,
    arrFilterMenu: {},
    isCanSave: false
  },
  condition: {
    currentModuleId: '',
    currentProjectId: '',
    currentPageNum: 0,
    filterSearchData: {},
    currentIsLeaf: false
  },
  getInitialState() {
    return {
      loading: false,
      data: [],
      visible: false,
      dataTotal: 0,
      auditMode:1,
      isInform:false,//审核保存时是否发送通知
      pageStyle: 'none',
      caseAuditHistory: [],
      currentPage: 1,
      // btnSaveDisabled: 'disabled',
      btnSaveDisabled:'',
      currentIsReadOnly: true,
      excelHeight: document.body.clientHeight - 188-30,
      excelWidth: document.body.clientWidth - 222,
      readOnlyColumns: ['status', 'createUser.nick_name', 'createDateFormat', 'caseAuditUser.nick_name', 'caseAuditDate'],
      readOnlyColumnsForIsChange: ['status', 'createUser.nick_name', 'createDateFormat', 'caseAuditUser.nick_name', 'caseAuditDate'],
      isBrowseSwitch: false,//false为浏览模式，true为编辑模式
      isBrowseDisabled: false,
      dataself: {},
      isBrowseName: '用例浏览模式',
      taskId:'',
      taskName:'',
      roleId:'',
      roleName:'',
      getThis: []
    }
  },
  componentDidMount() {
    window.isNeedSave = false;
    let _this = this;

    const colHeaders = ['记录', '子模块', '用例标题', '前提', '步骤', '步骤描述', '期待结果', '优先级', '编写人', '编写日期', '审核结果', '审核备注','审核人', '审核日期', '备注'];
    this.columns = [
      { header: '记录', data: 'status', readOnly: true, renderer: this.row_renderer, className: 'htMiddle htCenter', width: 40 },
      { header: '子模块', data: 'moduleName', readOnly: true, className: 'htMiddle htCenter', width: 120 },
      { header: '用例标题', data: 'casePurpose',readOnly: this.state.currentIsReadOnly,width: 150 },
      { header: '前提', data: 'casePremise', readOnly: this.state.currentIsReadOnly, width: 120 },
      { header: '步骤', data: 'caseStep', readOnly: this.state.currentIsReadOnly, className: 'htMiddle htCenter', width: 80 },
      { header: '步骤描述', data: 'caseStepDesc', readOnly: this.state.currentIsReadOnly, width: 250 },
      { header: '期待结果', data: 'caseExpectResult', readOnly: this.state.currentIsReadOnly, width: 250 },
      { header: '优先级', data: 'casePriority', editor: 'select', selectOptions: ['高', '中', '低'], className: 'htMiddle htCenter', readOnly: this.state.currentIsReadOnly, width: 90 },
      { header: '编写人', data: 'createUser.nick_name', readOnly: true, className: 'htCenter htMiddle', width: 80 },
      { header: '编写日期', data: 'createDateFormat', readOnly: true, className: 'htCenter htMiddle', width: 120 },
      { header: '审核结果', data: 'caseAudit', className: 'htMiddle htCenter',renderer:this.audit_col_renderer, width: 120, editor: 'select', selectOptions: ['通过', '不通过', '待审核'] },     
      { header: '审核备注', data: 'auditResultRemark', width: 220 },
      { header: '审核人', data: 'caseAuditUser.nick_name', readOnly: true, className: 'htCenter htMiddle', width: 80 },
      { header: '审核日期', data: 'caseAuditDate', readOnly: true, className: 'htCenter htMiddle', width: 120 },
      { header: '备注', data: 'caseRemark', width: 220 }
    ];
    const options = {
      rowHeaders: true,
      columns: this.columns,
      defcolHeaders: colHeaders,
      className: "htMiddle",
      outsideClickDeselects: false,
      minSpareRows: 1,
      renderAllRows: true,
      manualColumnResize: true,
      manualRowResize: true,
      height: this.state.excelHeight,
      width: this.state.excelWidth,
      colHeaders: function (index) {
        return colHeaders[index];
      },

      afterChange: function (change, source) {
        change && (window.isNeedSave = true);
        if (change) {
          for (var i = 0; i < change.length; i++) {
            var rowData = _this.hotTable.getSourceDataAtRow(change[i][0]);
            rowData.isChange = change[i][1] == "isChange" ? false : true;
          }
        }
      },

    };
    const $hot = this.refs.spreadsheet1;
    this.hotTable = new Handsontable($hot, options);
    this.acceptProjectChange();
    // this.userConfig(options);
    document.addEventListener("keydown", this.handKeyDown, false);
  },

  componentWillUnmount() {
    //window.clearInterval(window.timeSaveInterval);
    PubSubMsg.unsubscribe('caseAudit-excel-width-resize');
    PubSubMsg.unsubscribe('caseAudit-window-resize');
    PubSubMsg.unsubscribe('case-select-project');
    this.condition.currentModuleId = "";
    this.condition.currentIsLeaf = false;
    this.condition.currentProjectId = "";
    this.condition.currentPageNum = 0;
    this.condition.filterSearchData = {};
    document.removeEventListener("keydown", this.handKeyDown, false);
    window._CASE_SEARCH_OPTION = undefined;
  },
  //定时执行保存
  timingSave() {
    let _this = this;
    if (!_this.allSelectMode()) {
      //判断筛选模式下不进行保存
      //if (this.variable.currentData.length - 1 != sourceData.length) {
      //message.error("筛选模式下无法新增、删除用例，请检查筛选按钮!", 3);
      return;
      //}
    }
    if ((this.variable.isCanSave) && (window.isNeedSave)) {
      _this.hotTable.deselectCell();
      var sourceData = _this.hotTable.getSourceData();
      var hasChange = this.excelTableHasChange(true);
      if (hasChange) {
        this.ajaxSaveCase(sourceData);
      }
    }
  },
  //快捷键进行保存
  handKeyDown(event) {
    let _this = this;
    if (this.variable.isCanSave) {
      if (event.ctrlKey && event.keyCode == 83) {
        _this.hotTable.deselectCell();
        this.handelSave();
        event.preventDefault();
        return false;
      } else {
        return true;
      }
    }
  },
  acceptProjectChange() {
    let _this = this;
    PubSubMsg.subscribe('caseAudit-excel-width-resize', function (data) {
      let widthW = _this.state.excelWidth + data.width;
      _this.setState({
        excelWidth: widthW
      })
      if (_this.hotTable) {
        _this.hotTable.updateSettings({
          width: widthW
        });
      }
    });

    PubSubMsg.subscribe('caseAudit-window-resize', function (data) {
      _this.setState({
        excelHeight: data.height,
        excelWidth: data.width
      })
      if (_this.hotTable) {
        _this.hotTable.updateSettings({
          height: data.height,
          width: data.width
        });
      }
    });

    PubSubMsg.subscribe('case-select-project', function (data) {
      _this.setState({
        loading: true
      });
    
      _this.loadData(data);
    });
  },
  /**
   * 渲染审核记录按钮
   */
  row_renderer(instance, td, row, col, prop, value, cellProperties) {
    let _this = this;
    if (td.hasChildNodes()) {
      for (var j = td.children.length - 1; j >= 0; j--) {
        td.removeChild(td.children[j]);
      }
    }
    td.innerText = "";
    
    // if (value) {
      var rowData = instance.getSourceDataAtRow(row);
      if (rowData.hasAuditHistory) {
        var a = document.createElement('a');
        a.innerHTML = '<i class="fa fa-envelope" title="查看审核记录"></i>';
        a.class = "icon";
        td.appendChild(a);
        a.addEventListener("click", function () {
          _this.showHistory(_this.hotTable.getSourceDataAtRow(row));
        });

      }
    // }
  },
  /**
   * 渲染审核列数据颜色
   */
  audit_col_renderer(instance, td, row, col, prop, value, cellProperties) {
    Handsontable.renderers.TextRenderer.apply(this, arguments);
    if (value == '通过') {
      td.style.color = 'green';
    } else if (value == '不通过') {
      td.style.color = 'red';
    }
  },
  /**
   * 展示审核记录
   */
  showHistory(row) {
    let _this = this;
    const caseId = row._id;
    reqwest({
      url: API.CASE_ROWAUDITHISTORY,
      method: 'get',
      type: 'json',
      data: {
        caseId: caseId
      },
      success: (result) => {
        _this.setState({
          visible: true,
          data: result.data,
        });
      }
    });
  },

  handleCancel() {
    let _this = this;
    _this.setState({ visible: false });
  },
  /**
   * 筛选和非筛选模式切换
   */
  allSelectMode() {
    var isAllSelectMode = true;
    if ((this.condition.filterSearchData['审核结果'] && this.condition.filterSearchData['审核结果'] !== '所有')
      || (this.condition.filterSearchData['优先级'] && this.condition.filterSearchData['优先级'] !== '所有')) {
      isAllSelectMode = false;
    }
    return isAllSelectMode;
  }
  ,
 
  /**
   * 保存审核的用例
   */
  handelSave(e) {

    let _this = this;
    if (window.isNeedSave) {
      var sourceData = _this.hotTable.getSourceData();
      var hasChange = this.excelTableHasChange(true);
      if (hasChange) {
        //判断筛选模式下不进行保存
        if (!_this.allSelectMode()) {
          if (this.variable.currentData.length - 1 != sourceData.length) {
            message.error("筛选模式下无法新增、删除用例，请检查筛选按钮!", 3);
            return;
          }
        }
        this.ajaxSaveCase(sourceData);
      } else {
        message.info("未修改，无需保存", 2);
      }
    } else {
      message.info("未修改，无需保存", 2);
    }
  },
  /**
   * 判断表格是否有修改变化
   */
  excelTableHasChange(doSplice) {
    const _this = this;
    let sourceData = _this.hotTable.getSourceData();
    let hasChange = false;
    if (_this.variable.currentData.length != sourceData.length) {
      if (doSplice) {
        for (var i = 0; i < sourceData.length; i++) {
          sourceData[i].sort = i;
          if (_this.hotTable.isEmptyRow(i)) {
            sourceData.splice(i, 1);
          }
        }
      }
      hasChange = true;
    } else {
      for (var i = 0; i < sourceData.length; i++) {
        if (_this.allSelectMode()) {
          sourceData[i].sort = i;
        }
        if (sourceData[i]) {
          var nowRow = [], nowRowOld = [];
          var nowRowCol = [];
          for (var m = 0; m < this.columns.length; m++) {
            if (this.state.readOnlyColumnsForIsChange.indexOf(this.columns[m]['data']) < 0) {
              nowRow.push((sourceData[i][this.columns[m].data] === undefined || sourceData[i][this.columns[m].data] === null) ? '' : sourceData[i][this.columns[m].data]);
              nowRowCol.push(this.columns[m].data);
            }
          }

          for (var j = 0; j < this.variable.currentData.length; j++) {
            if (this.variable.currentData[j]._id == sourceData[i]._id) {
              for (var m = 0; m < this.columns.length; m++) {
                if (this.state.readOnlyColumnsForIsChange.indexOf(this.columns[m]['data']) < 0) {
                  nowRowOld.push((this.variable.currentData[j][this.columns[m].data] === undefined || this.variable.currentData[j][this.columns[m].data] === null) ? '' : this.variable.currentData[j][this.columns[m].data]);
                }
              }
            }
          }
          this.excelTableCaseChange(sourceData[i]);

          if (JSON.stringify(nowRowOld) == JSON.stringify(nowRow)) {
            sourceData[i].isChange = false;
          } else {
            sourceData[i].isChange = true;
          }
        }
        if (doSplice) {
          if (_this.hotTable.isEmptyRow(i)) {
            sourceData.splice(i, 1);
          }
        }
      }

      for (var i = 0; i < sourceData.length; i++) {
        if (sourceData[i].isChange) {
          hasChange = true;
        }
      }
    }

    return hasChange;
  },
  /**
   * 表格用例是否有变化
   */
  excelTableCaseChange(sourceData) {
    var nowRow = [], nowRowOld = [];
    var nowRowCol = [];
    for (var m = 0; m < this.columns.length; m++) {
      if (this.state.readOnlyColumnsForIsChange.indexOf(this.columns[m]['data']) < 0) {
        nowRow.push((sourceData[this.columns[m].data] === undefined || sourceData[this.columns[m].data] === null) ? '' : sourceData[this.columns[m].data]);
        nowRowCol.push(this.columns[m].data);
      }
    }

    for (var j = 0; j < this.variable.currentData.length; j++) {
      if (this.variable.currentData[j]._id == sourceData._id) {
        for (var m = 0; m < this.columns.length; m++) {
          if (this.state.readOnlyColumnsForIsChange.indexOf(this.columns[m]['data']) < 0) {
            nowRowOld.push((this.variable.currentData[j][this.columns[m].data] === undefined || this.variable.currentData[j][this.columns[m].data] === null) ? '' : this.variable.currentData[j][this.columns[m].data]);
          }
        }
      }
    }

    var indexCaseModul = nowRowCol.indexOf('moduleName');
    if (nowRowOld[indexCaseModul] == nowRow[indexCaseModul]) {
      sourceData.isCaseModul = false;
    } else {
      sourceData.isCaseModul = true;
    }

    var indexcasePurpose = nowRowCol.indexOf('casePurpose');
    if (nowRowOld[indexcasePurpose] == nowRow[indexcasePurpose]) {
      sourceData.iscasePurpose = false;
    } else {
      sourceData.iscasePurpose = true;
    }

    var indexcasePremise = nowRowCol.indexOf('casePremise');
    if (nowRowOld[indexcasePremise] == nowRow[indexcasePremise]) {
      sourceData.iscasePremise = false;
    } else {
      sourceData.iscasePremise = true;
    }

    var indexcaseStep = nowRowCol.indexOf('caseStep');
    if (nowRowOld[indexcaseStep] == nowRow[indexcaseStep]) {
      sourceData.iscaseStep = false;
    } else {
      sourceData.iscaseStep = true;
    }


    var indexcaseStepDesc = nowRowCol.indexOf('caseStepDesc');
    if (nowRowOld[indexcaseStepDesc] == nowRow[indexcaseStepDesc]) {
      sourceData.iscaseStepDesc = false;
    } else {
      sourceData.iscaseStepDesc = true;
    }

    var indexcaseExpectResult = nowRowCol.indexOf('caseExpectResult');
    if (nowRowOld[indexcaseExpectResult] == nowRow[indexcaseExpectResult]) {
      sourceData.iscaseExpectResult = false;
    } else {
      sourceData.iscaseExpectResult = true;
    }
    var indexcasePriority = nowRowCol.indexOf('casePriority');
    if (nowRowOld[indexcasePriority] == nowRow[indexcasePriority]) {
      sourceData.iscasePriority = false;
    } else {
      sourceData.iscasePriority = true;
    }
  },
  /**
   * 向服务端提交保存审核用例
   */
  ajaxSaveCase(sourceData) {
    const _this = this;
    let url = API.CASEAUDIT_JSONDATA + '/' + this.condition.currentProjectId + '/' + this.condition.currentModuleId + "?";
    let paramStr = '';
    let urlEncode = function (param) {
      if (!param) return '';
      for (let i in param) {
        paramStr = paramStr + 'search[' + i + ']=' + param[i] + '&';
      }
      return paramStr;
    };
    url = url + '&' + urlEncode(_this.condition.filterSearchData);
    let productId = Storage.local.get(top_current_project) ? Funs.decrypt(Storage.local.get(top_current_project).currentProject, Funs.secret) : null;
    let type = Storage.local.get(top_current_project) ? Storage.local.get(top_current_project).type : null;

    url = url + 'productId=' + productId + '&' + 'type=' + type + '&'+'roleId=' + this.state.roleId+'&'+'isInform='+_this.state.isInform;
    if(this.state.roleId != SD && this.state.roleId != PM){
      url = url+'&'+'taskId='+this.state.taskId;
    }
    _this.setState({
      loading: true
    });
    reqwest({
      url: url,
      method: 'post',
      type: 'json',
      contentType: 'application/json',
      data: sourceData ? JSON.stringify(sourceData) : JSON.stringify(_this.hotTable.getSourceData()),
      success: function (result) {
        _this.setState({
          loading: false
        });
        message.success('保存成功', 2);
        window.isNeedSave = false;  
     
        if(_this.state.roleId != SD && _this.state.roleId != PM){
          if(result.data.qaIsComplete){
            PubSubMsg.publish('case-audit-projectTree', {});         
          }
          _this.renderExcelTable({
            module: _this.condition.currentModuleId,
            project: _this.condition.currentProjectId,
            offset: _this.condition.currentPageNum * 50,
            search: _this.condition.filterSearchData,
            navigateType : Storage.local.get(top_current_project) ? Storage.local.get(top_current_project).type : null,
            isBrowseSwitch: _this.state.isBrowseSwitch, //此为模式切换,
            taskId:_this.state.taskId?_this.state.taskId:'',
            roleId:_this.state.roleId,
            taskName:_this.state.taskName?_this.state.taskName:''
          });
  
        }else{
          if(_this.state.roleId == SD){
            if(result.data.sdIsComplete){
              PubSubMsg.publish('case-audit-projectTree', {});         
            }
          }else if(_this.state.roleId == PM){
            if(result.data.pmIsComplete){
              PubSubMsg.publish('case-audit-projectTree', {});         
            }
          }
           _this.renderExcelTable({
            module: _this.condition.currentModuleId,
            project: _this.condition.currentProjectId,
            offset: _this.condition.currentPageNum * 50,
            search: _this.condition.filterSearchData,
            roleId:_this.state.roleId,
            navigateType : Storage.local.get(top_current_project) ? Storage.local.get(top_current_project).type : null,
            isBrowseSwitch: _this.state.isBrowseSwitch, //此为模式切换,
          });
         
        }
        
      },
      error: (err) => {
        message.info('保存失败', 2);

      }
    });
  },
  menuClick(e) {
    const nodeData = e.item.props.value;
    if (e.item.props.attrClick) {
      this.setState({
        taskId: nodeData._id,
        taskName:nodeData.taskName
      });
      this.renderExcelTable({
            module: nodeData.moduleId,
            project: nodeData.projectId,
            taskId: nodeData._id,
            taskName:nodeData.taskName,
            navigateType : Storage.local.get(top_current_project) ? Storage.local.get(top_current_project).type : null,
          });
    }
  },
  /**
   * 菜单切换后， 加载对应的模块数据
   */
  loadData(self) {
    this.setState({
      roleId:self.roleId,
      roleName:self.roleName
    });
    const _this = this;
    if (window.isNeedSave && this.excelTableHasChange()) {
      if (self === true) {
        return true;
      } else {
        confirm({
          title: '当前操作还未保存!',
          content: '跳转后当前操作不保存，确定跳转吗？',
          onOk() {
            _this.load(self);
            window.isNeedSave = false;
          },
          onCancel() {
            _this.setState({
              loading: false,
              // isBrowseSwitch: false, //注释当前代码为解决点击取消后，页面编辑模式变为浏览模式（实际操作仍为编辑模式）
              // isBrowseName: '用例浏览模式'
            });
          }
        });
      }
    } else {
      if (self) {
        this.load(self);
      } else {
        return true;
      }
    }
  },
  /**
   * 加载表格数据，同时切换按钮状态
   */
  load(self) {
    this.state.dataself = self;//保存项目树点击信息
    const _this = this;
    const moduleId = self.moduleId || '',
      projectId = self.project,
      moduleName = moduleId ? self.moduleName : '';
    this.condition.currentModuleId = moduleId;
    this.condition.currentIsLeaf = self.isLeaf;
    this.condition.currentProjectId = projectId;
    // this.variable.currentHasEditPermissions = self.hasEditPermissions;
    //获取项目对应的审核页面模式（编辑模式OR浏览模式）
    let productId = Storage.local.get(top_current_project) ? Funs.decrypt(Storage.local.get(top_current_project).currentProject, Funs.secret) : null;
    reqwest({
      url: API.CASE_AUDIT_IS_BROWSE,
      method: 'get',
      type: 'json',
      data: {
        module: moduleId,
        project:productId,
        roleId:self.roleId,
        roleName:self.roleName,
        navigateType : Storage.local.get(top_current_project) ? Storage.local.get(top_current_project).type : null
      },
      success: (result) => {
        if(result.status === 200 && result.data.AuditMode === 2 && self.roleId != SD && self.roleId != PM){
          this.setState({
            isBrowseDisabled: false,
            isBrowseSwitch: true,
            currentIsReadOnly: false,
            isBrowseName: '用例编辑模式',
            auditMode:2,
            isInform:result.data.isInform
          });
          if(moduleId){
            // if (self.children) {
            //   this.setState({
            //     btnSaveDisabled:"disabled"//保存按钮是否可点
            //   });
            // }else{
            //   this.setState({
            //     btnSaveDisabled: ''//保存按钮是否可点
            //   });
            // }
            _this.variable.isCanSave = true;
          }
          this.renderExcelTable({
            module: this.condition.currentModuleId,
            project: this.condition.currentProjectId,
            offset: this.condition.currentPageNum * 50,
            search: this.condition.filterSearchData,
            navigateType : Storage.local.get(top_current_project) ? Storage.local.get(top_current_project).type : null,
            roleId:this.state.roleId,
            roleName:this.state.roleName,
            isBrowseSwitch: this.state.isBrowseSwitch //此为模式切换
          });
          // 设置用例字段可编辑
          // let setting = {
          //   cells: function (row, col, prop) {
          //     let cellProperties = {};
    
          //     if (_this.state.readOnlyColumns.indexOf(prop) < 0) {
          //       cellProperties.readOnly = false;
          //     }
              
          //     return cellProperties;
          //   }
          // };
          //  _this.hotTable.updateSettings(setting);
        }else{
          this.setState({
            isBrowseDisabled: true,
            isBrowseSwitch: false,
            currentIsReadOnly: true,
            isBrowseName: '用例浏览模式',
            isInform:result.data.isInform
          });
          if(moduleId){
            // if (self.children) {
            //   this.setState({
            //     btnSaveDisabled:"disabled"//保存按钮是否可点
            //   });
            // }else{
            //   this.setState({
            //     btnSaveDisabled: ''//保存按钮是否可点
            //   });
            // }
            _this.variable.isCanSave = true;
          }
          this.renderExcelTable({
            module: this.condition.currentModuleId,
            project: this.condition.currentProjectId,
            offset: this.condition.currentPageNum * 50,
            search: this.condition.filterSearchData,
            navigateType : Storage.local.get(top_current_project) ? Storage.local.get(top_current_project).type : null,
            roleId:this.state.roleId,
            roleName:this.state.roleName,
            isBrowseSwitch: this.state.isBrowseSwitch //此为模式切换
          });
        }
      }
    });
   
  }
  ,
  /**
   * 渲染 Exceltable 数据
   */
  renderExcelTable(data) {
    const _this = this;
    reqwest({
      url: API.CASE_AUDIT_TODO_LIST,
      method: 'get',
      type: 'json',
      data: data || {
        module: this.condition.currentModuleId,
        offset: this.condition.currentPageNum * 50,
        search: this.condition.filterSearchData,
        roleId: this.state.roleId,
        navigateType : Storage.local.get(top_current_project) ? Storage.local.get(top_current_project).type : null,
        isBrowseSwitch: this.state.isBrowseSwitch
      },
      success: (result) => {
         _this.hotTable.loadData(result.data.caseAuditInfo);
        if(result.status === 200 && result.data.caseAuditInfo.length<=1){
           message.info("你好，该模块没有需要审核的用例！", 2);
        }
        if(result.status === 200 && result.data.auditHistory){
            this.setState({
            tableLoading: false,
            caseAuditHistory: result.data.auditHistory,

            });
        }
        //设置用例单元格是否可编辑
        if(_this.state.roleId != SD && _this.state.roleId != PM){
            if(_this.state.auditMode == 2){
              let setting = {
                cells: function (row, col, prop) {
                  let cellProperties = {};
                  if(_this.state.readOnlyColumns.indexOf(prop) < 0){
                    cellProperties.readOnly = false;
                  }
                  for(var i=0;i<result.data.caseAuditInfo.length;i++){
                    var caseAuditUser = result.data.caseAuditInfo[i].caseAuditUser;
                    if(caseAuditUser){
                      if(caseAuditUser._id != Storage.local.get(top_current_project).u){                    
                        if(i == row){
                          cellProperties.readOnly = true;
                        }
                      
                      }
                    }
                  }

                  return cellProperties;
                }
              };
              _this.hotTable.updateSettings(setting);
            }else{
              let setting = {
                cells: function (row, col, prop) {
                  let cellProperties = {};
                  for(var i=0;i<result.data.caseAuditInfo.length;i++){
                    var caseAuditUser = result.data.caseAuditInfo[i].caseAuditUser;
                    if(caseAuditUser){
                      if(caseAuditUser._id != Storage.local.get(top_current_project).u){                    
                        if(i == row){
                          cellProperties.readOnly = true;
                        }
                      
                      }
                    }
                  }

                  return cellProperties;
                }
              };
              _this.hotTable.updateSettings(setting);
            }
        }
        _this.setState({
          loading: false,
        });
        _this.variable.currentData = $.extend(true, [], result.data.caseAuditInfo);

      }
    });
  },
  
  /**
   * 分页切换按钮事件
   */
  handPageChange(page) {
    this.setState({
      currentPage: page
    });
    if (page > 0) {
      page--;
    };
    this.renderExcelTable({
      module: this.condition.currentModuleId,
      project: this.condition.currentProjectId,
      offset: page * 50,
      search: this.condition.filterSearchData,
      navigateType : Storage.local.get(top_current_project) ? Storage.local.get(top_current_project).type : null,
      isBrowseSwitch: this.state.isBrowseSwitch //此为模式切换
    });
  },
  
  render() {

    const menuItem = this.state.caseAuditHistory.map((item, index) => {

      var type = Storage.local.get(top_current_project) ? Storage.local.get(top_current_project).type : null;
      let strArr =[]

      if(type && type=="product"){
        strArr.push('子项目：' + item.ztModuleName);
        strArr.push('任务名称：' + item.taskName);
      }else{
        strArr.push ('任务名称：' + item.taskName);

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
      <Menu style={{ overflow: 'auto', maxHeight: 300}} onClick={this.menuClick}>
        {menuItem}
      </Menu>
    );
    const dropdownMenuDisplay = { 'display': (this.state.caseAuditHistory.length > 0 ? '' : 'none'), paddingLeft: 10 };
    const documentWidth = document.body.scrollWidth * 0.98;
    const columns = [{
     title: '审核时间',
      dataIndex: 'auditDate',
      className: "tdAlignCenter",
      width: documentWidth * 0.09
    }, {
      title: '审核人',
      dataIndex: 'userName',
      className: "tdAlignCenter",
      width: documentWidth * 0.06
    },{
      title: '审核人角色',
      dataIndex: 'userRole',
      className: "tdAlignCenter",
      width: documentWidth * 0.05
    }, { 
      title: '审核结果', 
      dataIndex: 'caseAudit',
      className: "tdAlignCenter", 
      width: documentWidth * 0.06,
      render(text) {
        if (text === '不通过') {
          return (<span style={{ color: 'red' }}>{text}</span>);
        } else if (text === '通过') {
          return (<span style={{ color: 'green' }}>{text}</span>);
        } else {
          return (<span style={{ color: 'gray' }}>{text}</span>);
        }
      }
    }, { 
      title: '审核备注', 
      dataIndex: 'auditResultRemark', 
      width: documentWidth * 0.10 
    }, {
      title: '子模块',
      dataIndex: 'moduleName',
      width: documentWidth * 0.05
    }, {
      title: '用例标题',
      dataIndex: 'casePurpose',
      width: documentWidth * 0.09
    }, {
      title: '前提',
      dataIndex: 'casePremise',
      width: documentWidth * 0.09
    }, {
      title: '步骤',
      dataIndex: 'caseStep',
      className: "tdAlignCenter",
      width: documentWidth * 0.04
    }, {
      title: '步骤描述',
      dataIndex: 'caseStepDesc',
      width: documentWidth * 0.15
    }, {
      title: '期待结果',
      dataIndex: 'caseExpectResult',
      width: documentWidth * 0.15
    }, {
      title: '优先级',
      dataIndex: 'casePriority',
      className: "tdAlignCenter",
      width: documentWidth * 0.04
    }];
    let type = Storage.local.get(top_current_project) ? Storage.local.get(top_current_project).type : null;
    return (
      <div >
        <Spin size="large" spinning={this.state.loading}>
          <div className="case-toolbar">
            <span style={{
              'border': '1px solid #d5f1fd', 'backgroundColor': '#eaf8fe', 'padding': '6px 6px 6px 16px',
              'borderRadius': '6px'
            }}>{this.state.isBrowseName}{/*：<Switch checked={this.state.isBrowseSwitch} disabled={this.state.isBrowseDisabled} />*/}
            </span>


            <Button id="saveButton" type="primary" style={{ 'marginLeft': '20px' }} disabled={this.state.btnSaveDisabled} onClick={this.handelSave}>
              <FAIcon type="fa-save" /> 保存
            </Button>
             <span style={dropdownMenuDisplay}>
              <Dropdown overlay={menu}>
                <a className="ant-dropdown-link">
                  选择要执行的任务 <Icon type="down" />
                </a>
              </Dropdown>
            </span>
            <span></span>
          </div>
          <div ref="spreadsheet1" className="case-spreadsheet1"></div>
          <div className="case-footer">
           
            <span className="rightBtn">&nbsp; &nbsp; </span>
            <ExcelPagination onPageChange={this.handPageChange} style={this.state.pageStyle}
              position={"pull-right"} total={this.state.dataTotal} currentPage={this.state.currentPage} pageSize={50} />
          </div>
          <div>
            <Modal ref="modal"
              visible={this.state.visible}
              title="审核记录" width="95%" onCancel={this.handleCancel}
              footer={[
                <Button key="back" type="ghost" size="large" onClick={this.handleCancel}>关闭</Button>,
              ]}>
              <Table columns={columns} size="middle" dataSource={this.state.data}
                rowKey={record => record._id}
                pagination={false} bordered scroll={{ y: 400 }} />
            </Modal>
          </div>
        </Spin>
      </div>
    );
  }
});

export default CaseAuditSpreadsheet;
