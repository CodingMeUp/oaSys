import './style.case.spreadsheet.less';
import React from 'react';
import { Tag, Switch, Alert, Table, Modal, Spin, Button, Icon, Upload, Pagination, message } from 'antd'
import reqwest from 'reqwest';
import PubSubMsg from '../../framework/common/pubsubmsg';
import 'handsontable.css';
import { default as Handsontable } from 'handsontable';
import UploadExcelBtn from './UploadExcelBtn';
import FAIcon from '../../framework/faicon/FAIcon';
import ExcelPagination from '../../component/ExcelPagination';
import API from '../API';
import $ from '../../framework/common/jquery-2.1.1.min';
import * as _ from 'lodash';
import Funs from '../../framework/common/functions';
import Storage from '../../framework/common/storage';
const top_current_project = Funs.top_current_project + '_' + _USERINFO.userId;
const confirm = Modal.confirm;
import ConfigTableBtn from './ConfigTableBtn';

const CaseSpreadsheet = React.createClass({
  config: {
    customColumns: [],
    userConfig_unVisibleCol: [],
    userConfig_customColHeaders: [],
    userConfig_fixedColumnsLeft: [],
    colWidths: [],
    contextMenuItem: {},
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
      auditData:[],
      visible: false,
      auditVisible:false,//审核历史页面展示
      dataTotal: 0,
      pageStyle: 'none',
      currentPage: 1,
      btnSaveDisabled: 'disabled',
      currentIsReadOnly: true,
      excelHeight: document.body.clientHeight - 188,
      excelWidth: document.body.clientWidth - 222,
      readOnlyColumns: ['status', 'createUser.nick_name', 'createDateFormat', 'caseAudit','otherAuditBysd','otherAuditBypm', 'caseAuditRemark'],
      readOnlyColumnsForIsChange: ['status', 'createUser.nick_name', 'createDateFormat','caseAudit','otherAuditBysd','otherAuditBypm', 'caseAuditRemark'],
      isBrowseSwitch: false,//false为浏览模式，true为编辑模式
      isBrowseDisabled: true,
      dataself: {},
      isBrowseName: '浏览模式',
      getThis: []
    }
  },
  componentDidMount() {
    //window.timeSaveInterval = window.setInterval(this.timingSave, 1000*60*10);
    window.isNeedSave = false;
    let _this = this;
    this.config.contextMenuItem = {
      callback: function (key, options) {
        if (key === 'audit_row') {
        }
      },
      items: {
        "undo": {
          name: '撤销'
        },
        "redo": {
          name: '恢复'
        },
        "hsep1": "---------",
        "row_above": {
          name: '在上方插入行'
        },
        "row_below": {
          name: '在下方插入行'
        },
        "remove_row": {
          name: '删除选中行'
        }
      }
    };
    const colHeaders = ['记录', '子模块', '用例标题', '前提', '步骤', '步骤描述', '期待结果', '优先级', '编写人', '编写日期', 'QA审核结果', '开发审核结果','策划审核结果','审核结果备注','备注'];
    this.columns = [
      { header: '记录', data: 'status', readOnly: true, renderer: this.row_renderer, className: 'htMiddle htCenter', width: 40 },
      { header: '子模块', data: 'moduleName', readOnly: true, className: 'htMiddle htCenter', width: 120 },
      { header: '用例标题', data: 'casePurpose', readOnly: this.state.currentIsReadOnly, width: 150 },
      { header: '前提', data: 'casePremise', readOnly: this.state.currentIsReadOnly, width: 120 },
      { header: '步骤', data: 'caseStep', readOnly: this.state.currentIsReadOnly, className: 'htMiddle htCenter', width: 80 },
      { header: '步骤描述', data: 'caseStepDesc', readOnly: this.state.currentIsReadOnly, width: 250 },
      { header: '期待结果', data: 'caseExpectResult', readOnly: this.state.currentIsReadOnly, width: 250 },
      { header: '优先级', data: 'casePriority', editor: 'select', selectOptions: ['高', '中', '低'], className: 'htMiddle htCenter', readOnly: this.state.currentIsReadOnly, width: 90 },
      // { header: '版本', data: 'caseVersion', readOnly: this.state.currentIsReadOnly, width: 80 },
      { header: '编写人', data: 'createUser.nick_name', readOnly: true, className: 'htCenter htMiddle', width: 80 },
      { header: '编写日期', data: 'createDateFormat', readOnly: true, className: 'htCenter htMiddle', width: 120 },
      { header: 'QA审核结果', data: 'caseAudit', className: 'htMiddle htCenter', renderer:this.audit_col_renderer,readOnly: true, width: 120, editor: 'select', selectOptions: ['通过', '不通过', '待审核'] },
      // { header: '审核人', data: 'caseAuditUser.nick_name', readOnly: true, className: 'htCenter htMiddle', width: 80 },
      // { header: '审核日期', data: 'caseAuditDate', readOnly: true, className: 'htCenter htMiddle', width: 120 },
      { header: '开发审核结果', data: 'otherAuditBysd', className: 'htMiddle htCenter',renderer:this.audit_col_renderer, readOnly: true, width: 120 ,editor: 'select', selectOptions: ['通过', '不通过', '待审核'] },
      { header: '策划审核结果', data: 'otherAuditBypm',  className: 'htMiddle htCenter',renderer:this.audit_col_renderer,readOnly: true, width: 120 ,editor: 'select', selectOptions: ['通过', '不通过', '待审核'] },
      { header: '审核结果备注', data: 'caseAuditRemark', readOnly: true, width: 220 },
      // { header: '测试人员', data: 'caseTestUser.nick_name', readOnly: true, width: 120 },
      // { header: '测试结果', data: 'caseTestResult', editor: 'select', className: 'htCenter htMiddle', selectOptions: ['通过', '不通过', '阻塞'], readOnly: this.state.currentIsReadOnly, width: 100 },
      { header: '备注', data: 'caseRemark', readOnly: this.state.currentIsReadOnly, width: 220 },
      // { header: 'BUG ID', data: 'caseBugId', className: 'htMiddle htCenter', readOnly: this.state.currentIsReadOnly, width: 80 }
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
      afterRemoveRow: function (index, amount) {
        window.isNeedSave = true;
      },
      afterSelection: function (r, c, r2, c2) {

      },
      afterLoadData: function (firstTime) {

      },
      afterRender: function (isForced) {
        if (_this.condition.filterSearchData['QA审核结果'] && _this.condition.filterSearchData['QA审核结果'] !== '所有') {
          $("button#audit").css('color', 'red');
          $("button#audit").attr('title', _this.condition.filterSearchData['QA审核结果']);
        }
        if (_this.condition.filterSearchData['优先级'] && _this.condition.filterSearchData['优先级'] !== '所有') {
          $("button#priority").css('color', 'red');
          $("button#priority").attr('title', _this.condition.filterSearchData['优先级']);
        }
        if (_this.condition.filterSearchData['开发审核结果'] && _this.condition.filterSearchData['开发审核结果'] !== '所有') {
          $("button#AuditBykf").css('color', 'red');
          $("button#AuditBykf").attr('title', _this.condition.filterSearchData['开发审核结果']);
        }
        if (_this.condition.filterSearchData['策划审核结果'] && _this.condition.filterSearchData['策划审核结果'] !== '所有') {
          $("button#AuditBych").css('color', 'red');
          $("button#AuditBych").attr('title', _this.condition.filterSearchData['策划审核结果']);
        }
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
      beforeAutofill: function (start, end, data) {
        let tempdata, temp, num, countRow, pushNum, arr = [];
        if (_this.hotTable.getColHeader(start.col).indexOf('步骤') >= 0 && data.length > 1) {
          tempdata = data[data.length - 1][0];
          if (tempdata.length > 4) {
            temp = tempdata.substring(0, 4);
            if (temp.toUpperCase() == "STEP") {
              num = parseInt(tempdata.substring(4, tempdata.length));
              countRow = end.row - start.row + 1;
              if (countRow > data.length) {
                pushNum = countRow - data.length;
                for (var i = 0; i < data.length; i++) {
                  num = num + 1;
                  data[i][0] = "step" + num;
                }
                for (var j = 0; j < pushNum; j++) {
                  arr = [];
                  num = num + 1;
                  arr.push("step" + num);
                  data.push(arr);
                }
              } else {
                for (var i = 0; i < data.length; i++) {
                  num = num + 1;
                  data[i][0] = "step" + num;
                }
              }
            }
          }
        }
      },
      afterAutofillApplyValues: function (startArea, entireArea) {
      },
      afterColumnResize: function (currentColumn, newSize, isDoubleClick) {
      },
    };
    const $hot = this.refs.spreadsheet;
    this.hotTable = new Handsontable($hot, options);
    this.acceptProjectChange();
    this.userConfig(options);
    document.addEventListener("keydown", this.handKeyDown, false);

    PubSubMsg.subscribe('get_current_project', function (resData) {
      //顶部产品、项目变化时，右侧用例执行页面显示为空
       _this.hotTable.loadData([]);
    });
  },
  componentWillUnmount() {
    //window.clearInterval(window.timeSaveInterval);
    PubSubMsg.unsubscribe('case-excel-width-resize');
    PubSubMsg.unsubscribe('case-window-resize');
    PubSubMsg.unsubscribe('case-select-project');
    PubSubMsg.unsubscribe('get_current_project');
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
    PubSubMsg.subscribe('case-excel-width-resize', function (data) {
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

    PubSubMsg.subscribe('case-window-resize', function (data) {
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
   * 渲染变更记录按钮
   */
  row_renderer(instance, td, row, col, prop, value, cellProperties) {
    let _this = this;
    if (td.hasChildNodes()) {
      for (var j = td.children.length - 1; j >= 0; j--) {
        td.removeChild(td.children[j]);
      }
    }    
    td.innerText = "";
    if (value) {
      var rowData = instance.getSourceDataAtRow(row);
      // console.log(rowData);
      if (rowData.hasRevision) {
        var a = document.createElement('a');
        a.innerHTML = '<i class="fa fa-reorder" title="查看变更记录"></i>&nbsp';
        a.class = "icon";
        td.appendChild(a);
        // td.innerHTML='<a class="icon" title="查看变更记录"><i class="fa fa-reorder"></i></a>';
        a.addEventListener("click", function () {
          _this.showHistory(_this.hotTable.getSourceDataAtRow(row));
        });

      }

      //判断是否显示审核记录图标
      if(rowData.hasAuditHistory){
        var hasAudit = document.createElement('a');
        hasAudit.innerHTML = '<i class="fa fa-envelope" title="查看审核记录"></i>';
        hasAudit.class = "icon";
        td.appendChild(hasAudit);        
        hasAudit.addEventListener("click", function () {
          _this.showAuditHistory(_this.hotTable.getSourceDataAtRow(row));
        });

      }
      
    }
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
   * 展示变更记录
   */
  showHistory(row) {
    let _this = this;
    const caseId = row._id;
    reqwest({
      url: API.CASE_ROWHISTORY,
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
  //展示审核记录
  showAuditHistory(row){
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
          auditVisible: true,
          auditData: result.data,
        });        
      }
    });
  },
  /**
   * 根据用户配置，显示栏位
   */
  userConfig(options) {
    let _this = this;
    reqwest({
      url: API.CASE_USERCONFIG,
      method: 'get',
      type: 'json',
      data: {
        projectId: this.condition.currentProjectId,
        moduleId: this.condition.currentModuleId
      },
      success: (result) => {
        _this.config.defcolums = options.columns;

        var userConfigInfo = result.userConfig[0].userConfig;               
        this.config.userConfig_customColHeaders = userConfigInfo.customColHeadersNew.length > 0 ? userConfigInfo.customColHeadersNew : options.defcolHeaders;//若数据库未配置，取默认值

        for (var j = 0; j < options.columns.length; j++) {
          this.config.colWidths.push(options.columns[j]['width']);
        }

        _this.config.customColumns = [];
        if (this.config.userConfig_customColHeaders) {

          for (let i = 0; i < this.config.userConfig_customColHeaders.length; i++) {
            for (let j = 0; j < options.columns.length; j++) {
              if (options.columns[j].header == this.config.userConfig_customColHeaders[i]) {
                _this.config.customColumns.push(options.columns[j]);
              }
            }
          }

        }

        var newColWidths = $.extend(true, [], this.config.colWidths);
        var newColHeaders = $.extend(true, [], this.config.userConfig_customColHeaders.length > 0 ? this.config.userConfig_customColHeaders : options.defcolHeaders);
        var newColumns = $.extend(true, [], _this.config.customColumns.length > 0 ? _this.config.customColumns : options.columns);

        for (let i = 0; i < userConfigInfo.unVisibleColNew.length; i++) {
          var index;

          for (let j = 0; j < newColHeaders.length; j++) {
            if (newColHeaders[j] == userConfigInfo.unVisibleColNew[i]) {
              index = j;
            }
          }

          if (index) {
            newColWidths.splice(index, 1);
            newColHeaders.splice(index, 1);
            newColumns.splice(index, 1);

          }
        }
        
        var setting = {
          colWidths: newColWidths,
          columns: newColumns,
          colHeaders: function (index) {
            if (newColHeaders[index] == '') {
              return "记录"
            }
            if (newColHeaders[index] == '优先级') {
              return '<span class="colHeader">优先级</span>' +
                '<button id="priority" data-name="优先级" class="changeType">\u25BC</button>';
            }
            if (newColHeaders[index] == 'QA审核结果') {
              return '<span class="colHeader">QA审核结果</span>' +
                '<button id="audit" data-name="QA审核结果" class="changeType">\u25BC</button>';
            }
            if (newColHeaders[index] == '开发审核结果') {
              return '<span class="colHeader">开发审核结果</span>' +
                '<button id="AuditBykf" data-name="开发审核结果" class="changeType">\u25BC</button>';
            }
            if (newColHeaders[index] == '策划审核结果') {
              return '<span class="colHeader">策划审核结果</span>' +
                '<button id="AuditBych" data-name="策划审核结果" class="changeType">\u25BC</button>';
            }
            return newColHeaders[index];
          },

        };
        setting.fixedColumnsLeft = userConfigInfo.fixedColumnsLeft;


        _this.hotTable.updateSettings(setting);
        _this.handIniMenuButton();
        _this.iniChangeTypeMenuLi();

        var self = {
          module: this.condition.currentModuleId,
          project: this.condition.currentProjectId,
          offset: this.condition.currentPageNum * 50,
          search: this.condition.filterSearchData,
          navigateType : Storage.local.get(top_current_project) ? Storage.local.get(top_current_project).type : null,
          isBrowseSwitch: this.state.isBrowseSwitch

        };
        
        _this.renderExcelTable(self);

      }
    });

  },
  /**
   * 初始化下拉菜单
   */
  handIniMenuButton() {
    const _this = this;
    $('body').on('click', '.changeType', function (event) {
      var menu;
      var dataName = $(this).attr('data-name');
      if (!_this.variable.arrFilterMenu[dataName]) {
        menu = _this.buildMenu(dataName, '所有');
        _this.variable.arrFilterMenu[dataName] = menu;
      } else {
        menu = _this.variable.arrFilterMenu[dataName];
      }

      var changeTypeMenu, position, removeMenu;
      document.body.appendChild(menu);

      event.preventDefault();
      event.stopImmediatePropagation();

      changeTypeMenu = document.querySelectorAll('.changeTypeMenu');
      for (var i = 0, len = changeTypeMenu.length; i < len; i++) {
        changeTypeMenu[i].style.display = 'none';
      }
      menu.style.display = 'block';
      position = $(this).offset();

      //menu.style.top = (position.top + (window.scrollY || window.pageYOffset)) + 2 + 'px';
      menu.style.top = (position.top) + 2 + 'px';   //
      menu.style.left = (position.left) + 'px';
      removeMenu = function (event) {
        if (event.target.nodeName == 'LI' && event.target.parentNode.className.indexOf('changeTypeMenu') !== -1) {
          if (menu.parentNode) {
            menu.parentNode.removeChild(menu);
          }
        } else {
          $('.changeTypeMenu').remove();
        }
      };
      Handsontable.Dom.removeEvent(document, 'click', removeMenu);
      Handsontable.Dom.addEvent(document, 'click', removeMenu);
      // 修复滚轮滑动时候用例表头筛选功能的错乱
      $('.wtHolder').on('scroll', function () {
        if (menu.parentNode) {
          menu.parentNode.removeChild(menu);
          $('.changeTypeMenu').remove();
        }
      });

    })

  },
  buildMenu(cell, activeCellType) {
    var
      menu = document.createElement('UL'),
      types = [],
      item;
    if (cell === '优先级') {
      types = ['所有', '高', '中', '低'];
    }
    if (cell === 'QA审核结果') {
      types = ['所有', '通过', '不通过', '待审核'];
    }
    if (cell === '开发审核结果') {
      types = ['所有', '通过', '不通过', '待审核'];
    }
    if (cell === '策划审核结果') {
      types = ['所有', '通过', '不通过', '待审核'];
    }
    menu.className = 'changeTypeMenu';
    menu.setAttribute("menuid", cell);
    for (var i = 0, len = types.length; i < len; i++) {
      item = document.createElement('LI');
      if ('innerText' in item) {
        item.innerText = types[i];
      } else {
        item.textContent = types[i];
      }
      item.setAttribute("colType", types[i]);
      item.setAttribute("type", cell);
      item.data = { 'colType': types[i], 'type': cell };

      if (activeCellType == types[i]) {
        item.className = 'active';
      }
      menu.appendChild(item);
    }
    return menu;
  }
  ,
  handleCancel() {
    let _this = this;
    _this.setState({ visible: false });
  },
  audithandleCancel(){
    let _this = this;
    _this.setState({ auditVisible: false });
  },
  /**
   * 筛选和非筛选模式切换
   */
  allSelectMode() {
    var isAllSelectMode = true;    
    if ((this.condition.filterSearchData['QA审核结果'] && this.condition.filterSearchData['QA审核结果'] !== '所有')
      || (this.condition.filterSearchData['优先级'] && this.condition.filterSearchData['优先级'] !== '所有')
      || (this.condition.filterSearchData['开发审核结果'] && this.condition.filterSearchData['开发审核结果'] !== '所有')
      || (this.condition.filterSearchData['策划审核结果'] && this.condition.filterSearchData['策划审核结果'] !== '所有')) {
      isAllSelectMode = false;
    }
    return isAllSelectMode;
  }
  ,
  iniChangeTypeMenuLi() {
    const _this = this;
    $('body').on('click', '.changeTypeMenu li', function (event) {
      _this.state.getThis = $(this);
      var ischange = _this.excelTableHasChange(true);
      //包含未保存用例时，不允许筛选
      if (window.isNeedSave && ischange) {
        confirm({
          title: '当前包含未保存用例，确定筛选吗？',
          content: '确定后，仅对已保存用例进行筛选',
          onOk() {
            _this.fetchChangeTypeMenu();
          },
          onCancel() { },
        });
      } else {
        _this.fetchChangeTypeMenu();
      }
    })
  },
  fetchChangeTypeMenu() {
    const _this = this;
    
    if (_this.state.getThis.attr('colType') != '所有') {
      message.warning('筛选模式下，新增/删除用例将无法保存，请慎重！', 3);
    }    
    
    _this.condition.filterSearchData[_this.state.getThis.attr('type')] = _this.state.getThis.attr('colType');
    window._CASE_SEARCH_OPTION = _this.condition.filterSearchData;
    
    _this.state.getThis.parent().find('li').each(function (i, item) {
      $(item).attr('class', '');
    });
    _this.state.getThis.attr('class', 'active');
    if (_this.allSelectMode()) {      
      _this.config.contextMenuItem = {
        items: {
          "undo": {
            name: '撤销'
          },
          "redo": {
            name: '恢复'
          },
          "hsep1": "---------",
          "row_above": {
            name: '在上方插入行'
          },
          "row_below": {
            name: '在下方插入行'
          },
          "remove_row": {
            name: '删除选中行'
          }
        }
      }
    } else {
      _this.config.contextMenuItem = {
        items: {
          "undo": {
            name: '撤销'
          },
          "redo": {
            name: '恢复'
          },
          "hsep1": "---------",
          "row_above": {
            name: '在上方插入行',
            disabled: true
          },
          "row_below": {
            name: '在下方插入行',
            disabled: true
          },
          "remove_row": {
            name: '删除选中行',
            disabled: true
          }
        }
      }
    }
    let
      setting = {
        contextMenu: _this.config.contextMenuItem
      };
    
    _this.hotTable.updateSettings(setting);    
    _this.renderExcelTable({
      module: _this.condition.currentModuleId,
      project: _this.condition.currentProjectId,
      offset: _this.condition.currentPageNum * 50,
      search: _this.condition.filterSearchData,
      navigateType : Storage.local.get(top_current_project) ? Storage.local.get(top_current_project).type : null,
      isBrowseSwitch: _this.state.isBrowseSwitch //此为模式切换
    });
  },
  //对优先级栏位进行基础过滤检查
  excelTableisConform() {
    let _this = this;
    let isConform = false;
    let sourceData = _this.hotTable.getSourceData();
    for (var i = 0; i < sourceData.length; i++) {
      if ((sourceData[i].casePriority != '高') && (sourceData[i].casePriority != '中') && (sourceData[i].casePriority != '低') && (sourceData[i].casePriority != '') && (sourceData[i].casePriority != null)) {
        isConform = true;
      }
    }
    return isConform
  }
  ,
  /**
   * 保存编辑的用例
   */
  handelSave(e) {
    let _this = this;
    let isConform = _this.excelTableisConform();
    if (isConform) {
      message.error("优先级栏位输入错误，正确输入[高、中、低]后再保存", 3);
      return
    }
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
          //这个不用
          // if(allSelectMode()){
          // 	sourceData[i].sort = i;
          // }
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
   * 向服务端提交保存用例
   */
  ajaxSaveCase(sourceData) {
    const _this = this;
    let url = API.CSAE_JSONDATA + '/' + this.condition.currentProjectId + '/' + this.condition.currentModuleId + "?";
    //let url = '/manage/case/' + this.condition.currentProjectId + '/' + this.condition.currentModuleId + '?savetype=0';
    let paramStr = '';
    let urlEncode = function (param) {
      if (!param) return '';
      for (let i in param) {
        paramStr = paramStr + 'search[' + i + ']=' + param[i] + '&';
      }
      return paramStr;
    };
    url = url + '&' + urlEncode(_this.condition.filterSearchData);
    //add by dwq for 新增产品流程业务逻辑修改
    let productId = Storage.local.get(top_current_project) ? Funs.decrypt(Storage.local.get(top_current_project).currentProject, Funs.secret) : null;
    let type = Storage.local.get(top_current_project) ? Storage.local.get(top_current_project).type : null;
    url = url + 'productId=' + productId + '&' + 'type=' + type;
    //add end
    _this.setState({
      loading: true
    });
    reqwest({
      url: url,
      method: 'post',
      type: 'json',
      contentType: 'application/json',
      data: sourceData ? JSON.stringify(sourceData) : JSON.stringify(_this.hotTable.getSourceData()),
      success: function (data) {
        _this.setState({
          loading: false
        });
        window.isNeedSave = false;
        _this.renderExcelTable({
          module: _this.condition.currentModuleId,
          project: _this.condition.currentProjectId,
          offset: _this.condition.currentPageNum * 50,
          search: _this.condition.filterSearchData,
          navigateType : Storage.local.get(top_current_project) ? Storage.local.get(top_current_project).type : null,
          isBrowseSwitch: _this.state.isBrowseSwitch //此为模式切换
        });
        message.success('保存成功', 2);
      },
      error: (err) => {
        message.success('保存失败', 2);

      }
    });
  },
  /**
   * 菜单切换后， 加载对应的模块数据
   */
  loadData(self) {    
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
              // isBrowseName: '浏览模式'
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
      projectId = self.projectId,
      moduleName = moduleId ? self.moduleName : '',
      isBrowse = self.isBrowse;
    this.condition.currentModuleId = moduleId;
    this.condition.currentIsLeaf = self.isLeaf;
    this.condition.currentProjectId = projectId;
    this.variable.currentHasEditPermissions = self.hasEditPermissions;
    if (projectId && moduleId == '') {
      _this.setState({
        isBrowseDisabled: true,
        isBrowseSwitch: false,
        isBrowseName: '浏览模式'
      });
    }

    if (moduleId) {
      if (isBrowse) {//判断是否为浏览权限
        _this.setState({
          isBrowseDisabled: true,
          isBrowseSwitch: false,
          isBrowseName: '浏览模式'
        });
      } else {
        if (self.children) {//若有下级模块，允许切换
          this.state.isBrowseSwitch = true;
          this.state.isBrowseName = '编辑模式';

          if (this.state.isBrowseSwitch == false) {
            this.variable.currentHasEditPermissions = false;//浏览模式时不允许编辑
          }
          _this.setState({
            isBrowseDisabled: false,
          });
        } else {
          //若没有下级模块，不允许切换
          _this.state.isBrowseSwitch = true;
          _this.setState({
            isBrowseSwitch: true,
            isBrowseDisabled: true,
            isBrowseName: '编辑模式'
          });
        }
      }
    }

    if (this.condition.currentModuleId) {
      _this.setState({ pageStyle: "none" });
      _this.setState({ currentPage: 1 });
    };
    if (isBrowse) {
      if (moduleId) {
        message.info("当前项目仅浏览权限", 2);
      }
      _this.setState({
        btnSaveDisabled: "disabled",
        // btnSaveDisplay: "none",
        currentIsReadOnly: true
      });
      _this.variable.isCanSave = false;
    } else {
      if (moduleId) {
        _this.setState({
          btnSaveDisabled: '',
          // btnSaveDisplay: '',
          currentIsReadOnly: false
        });
        _this.variable.isCanSave = true;
      } else {
        _this.setState({
          btnSaveDisabled: "disabled",
          currentIsReadOnly: true
        })
        _this.variable.isCanSave = false;
      }
    }
    this.renderExcelTable({
      module: this.condition.currentModuleId,
      project: this.condition.currentProjectId,
      offset: this.condition.currentPageNum * 50,
      search: this.condition.filterSearchData,
      navigateType : Storage.local.get(top_current_project) ? Storage.local.get(top_current_project).type : null,
      isBrowseSwitch: this.state.isBrowseSwitch //此为模式切换
    });
  }
  ,
  /**
   * 渲染 Exceltable 数据
   */
  renderExcelTable(data) {
    const _this = this;    
      // console.log(data);
    reqwest({
      url: API.CASE_EXCELJSON,
      method: 'get',
      type: 'json',
      data: data || {
        module: this.condition.currentModuleId,
        project: this.condition.currentProjectId,
        offset: this.condition.currentPageNum * 50,
        search: this.condition.filterSearchData,
        navigateType : Storage.local.get(top_current_project) ? Storage.local.get(top_current_project).type : null,
        isBrowseSwitch: this.state.isBrowseSwitch
      },
      success: (result) => {           

         _this.hotTable.loadData(result.data);

        if (this.state.isBrowseSwitch == false) {
          this.variable.currentHasEditPermissions = false;//浏览模式时不允许编辑
        } else {
          this.variable.currentHasEditPermissions = true;//浏览模式时不允许编辑
        }
        _this.setState({
          loading: false,
          dataTotal: result.total
        });
        _this.variable.currentData = $.extend(true, [], result.data);
        let setting = {
          cells: function (row, col, prop) {
            let cellProperties = {};
            if (_this.condition.currentModuleId) {
              if (_this.variable.currentHasEditPermissions) {
                if (_this.state.readOnlyColumns.indexOf(prop) < 0) {
                  cellProperties.readOnly = _this.state.currentIsReadOnly;
                }
              } else {
                cellProperties.readOnly = true;
              }
            }
            return cellProperties;
          }
        };
        if (_this.state.currentIsReadOnly) {
          setting.contextMenu = false;
        } else {
          if (_this.condition.currentModuleId) {
            setting.contextMenu = _this.config.contextMenuItem;
          } else {
            setting.contextMenu = false;
          }
        }
        // console.log(setting);
        _this.hotTable.updateSettings(setting);
        if (!this.condition.currentModuleId && _this.state.currentIsReadOnly && result.total > 50) {
          _this.setState({ pageStyle: "" });
        } else {
          _this.setState({ pageStyle: "none" });
        }

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
  //切换浏览/编辑模式
  onChange(checked) {
    let _this = this;

    if (window.isNeedSave && this.excelTableHasChange()) {
      message.error("请先保存用例后再进行模式切换！", 3);
    } else {
      if (checked) {
        _this.setState({
          isBrowseSwitch: checked,
          isBrowseName: '编辑模式'
        });
      } else {
        _this.setState({
          isBrowseSwitch: checked,
          isBrowseName: '浏览模式'
        });
      }

      _this.state.isBrowseSwitch = checked;
      this.renderExcelTable({
        module: this.condition.currentModuleId,
        project: this.condition.currentProjectId,
        offset: this.condition.currentPageNum * 50,
        search: this.condition.filterSearchData,
        navigateType : Storage.local.get(top_current_project) ? Storage.local.get(top_current_project).type : null,
        isBrowseSwitch: this.state.isBrowseSwitch //此为模式切换
      });
    }


  },
  render() {
    // window.currentModuleId = this.condition.currentModuleId;
    // window.currentProjectId = this.condition.currentProjectId;
    const documentWidth = document.body.scrollWidth * 0.9;
    const columns = [{
      title: '变更时间',
      dataIndex: 'createDateFormat',
      width: documentWidth * 0.1
    }, {
      title: '变更人',
      dataIndex: 'createUser',
      width: documentWidth * 0.05
    }, {
      title: '操作方式',
      dataIndex: 'type',
      width: documentWidth * 0.05
    }, {
      title: '子模块',
      dataIndex: 'moduleName',
      width: documentWidth * 0.05
    }, {
      title: '用例标题',
      dataIndex: 'casePurpose',
      width: documentWidth * 0.15
    }, {
      title: '前提',
      dataIndex: 'casePremise',
      width: documentWidth * 0.1
    }, {
      title: '步骤',
      dataIndex: 'caseStep',
      width: documentWidth * 0.05
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
      width: documentWidth * 0.05
    }, {
      title: '备注',
      dataIndex: 'caseRemark',

    }];
    const auditColumns = [{
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
            }}>{this.state.isBrowseName}：<Switch checked={this.state.isBrowseSwitch} onChange={this.onChange} disabled={this.state.isBrowseDisabled} />
            </span>


            <Button id="saveButton" type="primary" style={{ 'marginLeft': '20px' }} disabled={this.state.btnSaveDisabled} onClick={this.handelSave}>
              <FAIcon type="fa-save" /> 保存
            </Button>

            <span className="rightBtn">
              <UploadExcelBtn projectId={this.condition.currentProjectId} moduleId={this.condition.currentModuleId} types={type} isLeaf={this.condition.currentIsLeaf} />
            </span>
          </div>
          <div ref="spreadsheet" className="case-spreadsheet"></div>
          <div className="case-footer">

            <ConfigTableBtn userConfig={this.userConfig} loadData={this.loadData} defcolums={this.config.defcolums} excelTableHasChange={this.excelTableHasChange} />

            <span className="rightBtn">&nbsp; &nbsp; </span>
            <ExcelPagination onPageChange={this.handPageChange} style={this.state.pageStyle}
              position={"pull-right"} total={this.state.dataTotal} currentPage={this.state.currentPage} pageSize={50} />
          </div>
         
          <div>
            <Modal ref="modal"
              visible={this.state.visible}
              title="变更记录" width="90%" onCancel={this.handleCancel}
              footer={[
                <Button key="back" type="ghost" size="large" onClick={this.handleCancel}>关闭</Button>,
              ]}>
              <Table columns={columns} size="middle" dataSource={this.state.data}
                rowKey={record => record._id}
                pagination={false} bordered scroll={{ y: 400 }} />
            </Modal>
          </div>
          
          <div>
            <Modal ref="modal"
              visible={this.state.auditVisible}
              title="审核记录" width="90%" onCancel={this.audithandleCancel}
              footer={[
                <Button key="back" type="ghost" size="large" onClick={this.audithandleCancel}>关闭</Button>,
              ]}>
              <Table columns={auditColumns} size="middle" dataSource={this.state.auditData}
                rowKey={record => record._id}
                pagination={false} bordered scroll={{ y: 400 }} />
            </Modal>
          </div>
        </Spin>
      </div>
    );
  }
});

export default CaseSpreadsheet;
