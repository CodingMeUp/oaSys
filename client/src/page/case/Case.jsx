import './style.case.less';
import React from 'react';
import ReactDOM from 'react-dom';
import reqwest from 'reqwest';
import { Breadcrumb, Menu, Icon, Tree, Tooltip, Spin, message, Modal, input } from 'antd'
import { Router, Route, Link, hashHistory } from 'react-router';
import Page from '../../framework/page/Page';
import FAIcon from '../../framework/faicon/FAIcon';
import PubSubMsg from '../../framework/common/pubsubmsg';
import CaseSpreadsheet from './CaseSpreadsheet';
import ProjectTree from './ProjectTree';
import UploadXmind from './UploadXmind';
import CaseCreateModule from './CaseCreateModule';
import Funs from '../../framework/common/functions';
import Storage from '../../framework/common/storage';
import * as _ from 'lodash';
import API from '../API';

const TreeNode = Tree.TreeNode;
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const top_current_project = Funs.top_current_project + '_' + _USERINFO.userId;
const Home = React.createClass({
  getInitialState() {
    return {
      loading: true,
      currentSelectShowType: 'excel',
      pageHeight: document.body.clientHeight - 88,
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
      copyModuleIdName: ''
    }
  },
  componentWillUnmount() {
    window.removeEventListener('resize', this.windowResize, false);
    window.showUploadDia = null;
    PubSubMsg.unsubscribe('unvisible-case-xmind-upload');
    PubSubMsg.unsubscribe('get_current_project');

    window.nodeDatas = {};
    if (this.cmContainer) {
      ReactDOM.unmountComponentAtNode(this.cmContainer);
      document.body.removeChild(this.cmContainer);
      this.cmContainer = null;
    }
    document.removeEventListener("click", this.hideMenu, false);

  },
  componentDidMount() {
    let _this = this;
    document.addEventListener("click", this.hideMenu, false);
    window.addEventListener('resize', this.windowResize, false);
    window.showUploadDia = this.showXmindUploadDialog; // xmind 用例上传 按钮 弹窗
    PubSubMsg.subscribe('unvisible-case-xmind-upload', function (data) {
      _this.setState({
        xmindModalVisible: false
      });
    });

    this.isFirstLoadMinderIframe = true;
    this.setState({
      loading: false
    });
    PubSubMsg.subscribe('get_current_project', function (resData) {
      //顶部产品、项目变化时，项目名称置为初始化
        _this.setState({
        currentProjectName: '项目名称'
      });
    });
    
  },
  windowResize() {
    let hei = document.body.clientHeight - 188;
    let wid = document.body.clientWidth - 222;
    this.setState({
      pageHeight: document.body.clientHeight - 88
    })

    PubSubMsg.publish('case-window-resize', { width: wid, height: hei });
  },
  showXmindUploadDialog() {
    let type = Storage.local.get(top_current_project) ? Storage.local.get(top_current_project).type : null;
    if (this.state.currentProjectId) {
      if (type == "product") {
        // console.log(this.state.isLeaf);
        if (this.state.currentIsLeaf == true) {
          this.setState({
            xmindModalVisible: true
          })
        } else {
          message.info("与PMS管理的项目，请在项目的叶子节点中导入用例");
        }
      } else {
        this.setState({
          xmindModalVisible: true
        })

      }

    } else {
      message.info('请选择需要导入的项目', 2);
    }
  },
  hideSideTree() {
    this.setState({
      sideBarDisplay: 'none',
      containerLeft: 0
    });
    PubSubMsg.publish('case-excel-width-resize', { width: 200 });
  },
  showSideTree() {
    this.setState({
      sideBarDisplay: '',
      containerLeft: 205
    });
    PubSubMsg.publish('case-excel-width-resize', { width: -200 });
  },
  handleMenuClick(e) {
    this.setState({
      currentSelectShowType: e.key
    });
    if ((!!window.nodeDatas) && (e.key === "excel")) {
      PubSubMsg.publish('case-select-project', window.nodeDatas);
    } else if (e.key === "xmind") {
      // console.log(window._CASE_SEARCH_OPTION);
      if (this.isFirstLoadMinderIframe) {
        this.refs.caseIframe.src = '/js/plugin/kityminder-editor/index.html';
        this.isFirstLoadMinderIframe = false;
      } else {
        window.frames["minderIframe"].renderMind(this.state.currentProjectId, this.state.currentModuleId);
      }
    }
  },
  onTreeSelect(info, e, node, event) {
    let navigateType = Storage.local.get(top_current_project) ? Storage.local.get(top_current_project).type : null;
    window.nodeDatas = e.node.props.nodeData;
    if ((!nodeDatas.children) && (!nodeDatas.moduleId)) {
      message.info("项目无模块，请先添加模块再进行编写用例", 3);
    }
    this.setState({
      currentProjectName: nodeDatas.parentText ? (nodeDatas.parentText + " - " + (nodeDatas.projectName ? nodeDatas.projectName : nodeDatas.moduleName)) : (nodeDatas.projectName ? nodeDatas.projectName : nodeDatas.moduleName),
      currentProjectId: nodeDatas.projectId,
      currentModuleId: nodeDatas.moduleId ? nodeDatas.moduleId : '',
      currentIsLeaf: nodeDatas.isLeaf ? nodeDatas.isLeaf : false
    });
    window.currentProjectId = nodeDatas.projectId;
    window.currentModuleId = nodeDatas.moduleId ? nodeDatas.moduleId : '';
    window.currentNavigateType = navigateType;

    if (this.state.currentSelectShowType === 'excel') {
      PubSubMsg.publish('case-select-project', nodeDatas);
    } else {
      window.frames["minderIframe"].renderMind(nodeDatas.projectId, nodeDatas.moduleId ? nodeDatas.moduleId : '',navigateType);
    }
  },
  onTreeRightClick(info) {
    if (info.node.props.nodeData.isBrowse == true) {
      return false;
    }
    if (this.toolTip) {
      ReactDOM.unmountComponentAtNode(this.cmContainer);
      this.toolTip = null;
    }
    if (info.node.props.nodeData.rowType == "module") {

      this.toolTip = (
        <Menu onClick={this.contextMenuClick.bind(this, info.node.props)}>
          <Menu.Item key="addModule"><Icon type="plus" /> 新增子模块&nbsp; &nbsp; </Menu.Item>
          <Menu.Item key="editModule"><Icon type="edit" /> 编辑模块&nbsp; &nbsp; </Menu.Item>
          <Menu.Item key="deleteModule"><Icon type="delete" /> 删除模块&nbsp; &nbsp; </Menu.Item>
          <Menu.Item key="copyModule"><FAIcon type="fa-copy" />&nbsp;&nbsp;&nbsp;&nbsp;复制模块&nbsp; &nbsp; </Menu.Item>
          <Menu.Item key="pasteModule"><FAIcon type="fa-paste" />&nbsp;&nbsp;&nbsp;&nbsp;粘贴模块&nbsp; &nbsp; </Menu.Item>
        </Menu>

      );
    } else {
      if (info.node.props.nodeData.isLeaf == false) {
        message.info("与PMS匹配的项目只能在叶子节点添加模块~！", 3);
      } else {
        this.toolTip = (
          <Menu onClick={this.contextMenuClick.bind(this, info.node.props)}>
            <Menu.Item key="addModule"><Icon type="plus" /> 新增模块&nbsp; &nbsp; </Menu.Item>
            <Menu.Item key="pasteModule"><FAIcon type="fa-paste" />&nbsp;&nbsp;&nbsp;&nbsp;粘贴模块&nbsp; &nbsp; </Menu.Item>
          </Menu>
        );
      }


    }

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
  hideMenu() {
    const container = this.getContainer();
    container.style.display = 'none';
  },
  getContainer() {
    if (!this.cmContainer) {
      this.cmContainer = document.createElement('div');
      this.cmContainer.className = 'case-do-v-treeContextMenu';
      document.body.appendChild(this.cmContainer);
    }
    return this.cmContainer;
  },
  contextMenuClick(node, e) {
    if (e.key === 'addModule') {
      reqwest({
        url: API.MAX_SORT,
        method: 'post',
        contentType: 'application/json',
        data: JSON.stringify({ id: node.nodeData.projectId }),
        type: 'json',
        success: (result) => {
          let option = {
            modualName: '',
            moduleDesc: '',
            //modalSort: result.data,
            modalSort:0
          };
          if (node.nodeData.rowType != "module") {
            this.setState({
              modalVisible: true,
              modalProjectId: node.nodeData.projectId,
              modalParentId: null,
              modualId: '',
              modualTitle: "新增模块",
              modualAction: "module_add"

            })
          } else {
            this.setState({
              modalVisible: true,
              modalProjectId: node.nodeData.projectId,
              modalParentId: node.nodeData._id,
              modualId: '',
              modualTitle: "新增模块",
              modualAction: "module_add"

            })
          }

          PubSubMsg.publish('refresh-tree-data-module', option);
        }
      });
    } else if (e.key === 'editModule') {
      let option = {
        modualName: node.nodeData.moduleName,
        moduleDesc: node.nodeData.moduleDesc,
        modalSort: node.nodeData.sort,
      };
      this.setState({
        modualId: node.nodeData._id,
        modalVisible: true,
        modalProjectId: node.nodeData.projectId,
        //modalParentId: node.nodeData._id,
        modualTitle: "编辑模块",
        modualAction: "module_edit"
      })
      PubSubMsg.publish('refresh-tree-data-module', option);

    } else if (e.key === 'deleteModule') {
      Modal.confirm({
        title: '您是否确认要删除【' + node.nodeData.moduleName + "】模块？",
        content: <div style={{ color: "red", fontWeight: "bold" }}>请慎重！！！<br />删除模块会一并删除子模块以及用例。</div>,
        okText: '取消',
        cancelText: '确定',
        onOk() {

        },
        onCancel() {
          reqwest({
            url: API.PROJECT_DELETE,
            method: 'delete',
            contentType: 'application/json',
            data: JSON.stringify({
              id: node.nodeData.moduleId,
              type: "module"
            }),
            type: 'json',
            success: (result) => {
              if (result.status === 200) {
                message.success("删除成功");
                if (result.data) {
                  PubSubMsg.publish('refresh-tree-data', { projectId: node.nodeData.projectId, rowId: result.data });
                } else {
                  PubSubMsg.publish('refresh-tree-data', { projectId: node.nodeData.projectId });
                }
              } else {
                message.success(result.message);
              }
            }
          })
        },
      });
    } else if (e.key === 'copyModule') {
      this.setState({
        copyModuleId: node.nodeData._id,
        copyProjectId: node.nodeData.project,
        copyModuleIdName: node.nodeData.moduleName
      })
    } else if (e.key === 'pasteModule') {
      let id = this.state.copyModuleId;
      if (!!id) {
        Modal.confirm({
          title: '您是否确认要粘贴【' + this.state.copyModuleIdName + "】模块？",
          content: <div style={{ color: "red", fontWeight: "bold" }}>请慎重！！！<br />粘贴模块会一并粘贴子模块以及用例。</div>,
          okText: '确定',
          cancelText: '取消',
          onOk() {
            reqwest({
              url: API.PROJECT_MODULPASTE_PUT,
              method: 'put',
              contentType: 'application/json',
              data: JSON.stringify({
                id: id,
                modalParentId: node.nodeData._id,
                projectId: node.nodeData.projectId,
                type: node.nodeData.rowType,
                navigateType: Storage.local.get(top_current_project) ? Storage.local.get(top_current_project).type : null,
                productId: Storage.local.get(top_current_project) ? Funs.decrypt(Storage.local.get(top_current_project).currentProject, Funs.secret) : null
              }),
              type: 'json',
              success: (result) => {
                let option = {
                  moduleName: '',
                  moduleDesc: '',
                  modalSort: result.data,
                };
                if (result.status === 200) {
                  message.success("粘贴成功");
                  if (result.data) {
                    PubSubMsg.publish('refresh-tree-data', { projectId: node.nodeData.projectId, rowId: result.data });
                  } else {
                    PubSubMsg.publish('refresh-tree-data', { projectId: node.nodeData.projectId });
                  }
                } else {
                  message.success(result.message);
                }

              }
            })
          },
          onCancel() {

          }
        });

      } else {
        message.info("无需要粘贴的模块，请先复制模块~");
      }


    }

  },
  modalCancel() {
    this.setState({
      modalVisible: false,
      modalProjectId: "",
      modalParentId: null,
    })
  },
  handShrink() {
    PubSubMsg.publish('refresh-tree-data-shrink', {});
  },
  render() {
    const pageHeader =
      <div>
        <h1 className="admin-page-header-title">用例编写</h1>
        <Breadcrumb>
          <Breadcrumb.Item>
            <Icon type="home" />
            首页
          </Breadcrumb.Item>
          <Breadcrumb.Item>用例管理</Breadcrumb.Item>
          <Breadcrumb.Item>用例编写</Breadcrumb.Item>
        </Breadcrumb>
      </div>;
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
    const caseExcelStyle = {
      display: this.state.currentSelectShowType == 'excel' ? '' : 'none'
    };
    const caseXmindStyle = {
      display: this.state.currentSelectShowType == 'xmind' ? '' : 'none'
    };
    const treeHeight = document.body.clientHeight - 123;
    return (
      <Page header={pageHeader} loading={this.state.loading} unShowPageAnimate={true}>
        <div className="case-content" >
          <div className="case-side" style={sidebarStyle} >
            <h2>
              项目列表
              <Tooltip placement="right" title="收起左边栏">
                <a className="icon" onClick={this.hideSideTree}><FAIcon type="fa-chevron-left" /></a>
              </Tooltip>
              <a className="icon">&nbsp; &nbsp; </a>
              <Tooltip placement="bottom" title="全部收缩">
                <a className="icon" onClick={this.handShrink}><FAIcon type="fa-compress" /></a>
              </Tooltip>
            </h2>
            <div className="case-side-tree" style={{ height: treeHeight }}>
              <ProjectTree
                onRightClick={this.onTreeRightClick}
                onSelect={this.onTreeSelect}
                />
            </div>
          </div>
          <div className="case-container" style={containerStyle}>
            <h2>
              <Tooltip placement="right" title="显示左边栏">
                <a className="icon" onClick={this.showSideTree} style={showTreeIconStyle}><FAIcon type="fa-chevron-right" /></a>
              </Tooltip>
              {this.state.currentProjectName}

              <div className="tab">
                <Menu onClick={this.handleMenuClick}
                  selectedKeys={[this.state.currentSelectShowType]}
                  mode="horizontal">
                  <Menu.Item key="excel">
                    <FAIcon type="fa-file-excel-o" /> Excel模式
                  </Menu.Item>
                  <Menu.Item key="xmind">
                    <FAIcon type="fa-file-image-o" /> 思维导图模式
                  </Menu.Item>
                </Menu>
              </div>
            </h2>
            <div style={caseExcelStyle}>
              <CaseSpreadsheet />
            </div>
            <div>
              <CaseCreateModule modalVisible={this.state.modalVisible} modalProjectId={this.state.modalProjectId}
                modalCancel={this.modalCancel} modualId={this.state.modualId} modalParentId={this.state.modalParentId}
                modualTitle={this.state.modualTitle} modualAction={this.state.modualAction} />
            </div>
            <div style={caseXmindStyle}>
              <Spin size="large" spinning={this.state.loading}>
                <iframe name="minderIframe" ref="caseIframe" className="case-iframe"></iframe>
              </Spin>
            </div>
          </div>
        </div>
        <UploadXmind xmindModalVisible={this.state.xmindModalVisible} projectId={this.state.currentProjectId} />
      </Page>
    );
  }
});

export default Home;
