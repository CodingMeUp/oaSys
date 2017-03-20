import './style.less';
import '../case/style.case.less';
import React from 'react';
import reqwest from 'reqwest';
import { Slider,Input, Select, Col, Form,Table, Button, Icon, Alert, Tag, message, Modal, Popover, Tooltip, Dropdown, Menu, notification } from 'antd'
import moment from 'moment';
import Ajax from '../../framework/common/ajax';
import PubSubMsg from '../../framework/common/pubsubmsg';
import $ from '../../framework/common/jquery-2.1.1.min';
import CaseAuditSpreadsheet from './CaseAuditSpreadsheet';
import CaseDoProjectTree from '../case_do/CaseDoProjectTree';
import FAIcon from '../../framework/faicon/FAIcon';
import Storage from '../../framework/common/storage';
import Funs from '../../framework/common/functions';
import * as _ from 'lodash';
import API from '../API';
import UiCtrl from '../utils/UiCtrl';


const createForm = Form.create;
const top_current_project = Funs.top_current_project + '_' + _USERINFO.userId;

let CaseAuditTodoList = React.createClass({

  getInitialState() {
    return {
      loading: true,
      currentSelectShowType: 'excel',
      pageHeight: document.body.clientHeight - 140,
      sideBarDisplay: '',
      containerLeft: 205,
      currentProjectName: '项目名称',
      currentModuleId: '',
      currentProjectId: '',
      currentIsLeaf: false,
      xmindModalVisible: false,
      modalVisible: false,
      modalProjectId: "",
      modalParentId: null,
      modalSort: 0,
      modualId: '',
      modualName: '',
      modualAction: '',
      modualTitle: '',
      moduleDesc: '',
      copyModuleId: '',
      copyProjectId: '',
      copyModuleIdName: '',
      isAuditQA:false,//判断是否是QA审核，默认为不是QA审核
      loadingIcon: 'reload',
    }
  },

  componentDidUpdate() {

  },
  componentWillUnmount() {
    window.removeEventListener('resize', this.windowResize, false);
    PubSubMsg.unsubscribe('case-audit-projectTree');
    document.removeEventListener("click", this.hideMenu, false);
  },
  
  componentDidMount() {
    let _this = this;
    document.addEventListener("click", this.hideMenu, false);
    window.addEventListener('resize', this.windowResize, false);

    PubSubMsg.subscribe('case-audit-projectTree', function (data) {
      _this.reloadTree();
    });


  },
  windowResize() {
    const _this = this;
    let hei = document.body.clientHeight - 188-33;
    let wid = document.body.clientWidth - 222;
    this.setState({
      pageHeight: document.body.clientHeight - 150
    })
    PubSubMsg.publish('caseAudit-window-resize', { width: wid, height: hei});
  },
  onTreeSelect(info, e, node, event,isShow) {
    
    let navigateType = Storage.local.get(top_current_project) ? Storage.local.get(top_current_project).type : null;
    //判断是否从分配页切换到用例审核页
    if(isShow){
      window.nodeDatas = e;
    }else{
      window.nodeDatas = e.node.props.nodeData;
    }
    
    // if ((!nodeDatas.children) && (!nodeDatas.moduleId)) {
    //   message.info("项目无模块，请先添加模块再进行编写用例", 3);
    // }
    this.setState({
      currentProjectName: nodeDatas.parentText ? (nodeDatas.parentText + " - " + (nodeDatas.projectName ? nodeDatas.projectName : nodeDatas.moduleName)) : (nodeDatas.projectName ? nodeDatas.projectName : nodeDatas.moduleName),
      currentProjectId: nodeDatas.project,
      currentModuleId: nodeDatas.moduleId ? nodeDatas.moduleId : '',
      currentIsLeaf: nodeDatas.isLeaf ? nodeDatas.isLeaf : false,

    });
    window.currentProjectId = nodeDatas.project;
    window.currentModuleId = nodeDatas.moduleId ? nodeDatas.moduleId : '';
    window.currentNavigateType = navigateType;    
    PubSubMsg.publish('case-select-project', nodeDatas);
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

hideSideTree() {
    this.setState({
      sideBarDisplay: 'none',
      containerLeft: 0
    });
    PubSubMsg.publish('caseAudit-excel-width-resize', { width: 200 });
  },
  showSideTree() {
    this.setState({
      sideBarDisplay: '',
      containerLeft: 205
    });
    PubSubMsg.publish('caseAudit-excel-width-resize', { width: -200 });
  },

  getModuleId(data){
    
    if(data){
      this.onTreeSelect(data._id,data,null,null,true);
    }

  },


  render() {
    let {filteredInfo} = this.state;

    const auth = window._USERINFO.auth;
  
    auth.forEach(item => {
      if (item.oper_href === '/client/auditQA') {
        this.state.isAuditQA = true;
      }
    });
   const sidebarStyle = {
      height: this.state.pageHeight,
      display: this.state.sideBarDisplay
    };
   const containerStyle = {
      height: this.state.pageHeight,
      left: this.state.containerLeft
    };
    const showTreeIconStyle = {
      display: this.state.sideBarDisplay == '' ? 'none' : ''
    };
    const caseAuditExcelStyle = {
      display: this.state.currentSelectShowType == 'excel' ? '' : 'none'
    };
  const treeHeight = document.body.clientHeight - 123;
    return (
      <div className="selftest-do-content" >
        <div className="case-do-side" style={sidebarStyle}>
          <h2>
            项目列表
            {/*<Tooltip placement="right" title="收起左边栏">
                <a className="icon" onClick={this.hideSideTree}><FAIcon type="fa-chevron-left" /></a>
            </Tooltip>*/}
            <a className="icon">&nbsp; &nbsp; </a>
            <Tooltip title="刷新" placement="bottom"><a className="icon" onClick={this.reloadTree}><Icon type={this.state.loadingIcon}/></a></Tooltip>
          </h2>
          <div className="case-side-tree">
            {/*<ProjectTree apiUrl={API.MODULE_TREE_WITH_CASE_DO_DOT} onSelect={this.onTreeSelect} openDotNode={true} />*/}
            <CaseDoProjectTree apiUrl={API.AUDIT_MODULE_TREE} getModuleId={this.getModuleId} onSelect={this.onTreeSelect} openDotNode={true} />

          </div>
        </div>
            <div className="case-container" style={containerStyle}>
            <h2>
              <Tooltip placement="right" title="显示左边栏">
                <a className="icon" onClick={this.showSideTree} style={showTreeIconStyle}><FAIcon type="fa-chevron-right" /></a>
              </Tooltip>
              {this.state.currentProjectName}
            </h2>
            <div style={caseAuditExcelStyle}>
              <CaseAuditSpreadsheet />
            </div>

          </div>

      </div>
    );
  }
});

CaseAuditTodoList = createForm()(CaseAuditTodoList);
export default CaseAuditTodoList;
