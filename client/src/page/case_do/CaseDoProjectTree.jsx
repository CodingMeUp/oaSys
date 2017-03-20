import React from 'react';
import reqwest from 'reqwest';
import { Alert, Breadcrumb, Menu, Icon, Tag,Tree, Tooltip, Spin, Badge, message } from 'antd'
import { Router, Route, Link, hashHistory } from 'react-router';
import Page from '../../framework/page/Page';
import FAIcon from '../../framework/faicon/FAIcon';
import PubSubMsg from '../../framework/common/pubsubmsg';
import API from '../API';
import Storage from '../../framework/common/storage';
import Funs from '../../framework/common/functions';
import ProjectSelect from '../case_do/ProjectSelect';


const TreeNode = Tree.TreeNode;
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const top_current_project = Funs.top_current_project + '_' + _USERINFO.userId;
const isShowAuditModule = false;
export const OnProSelect = {
  onProSelect: function (_this, v, opt) {
    _this.currentTreeData = !_this.currentTreeData ? [..._this.state.treeData] : _this.currentTreeData;
    if (v != 'all') {
      const projectName = v.split('--')[0];
      const projectId = v.split('--')[1];
      var newTreeData = [];
      for (var i = 0; i < _this.currentTreeData.length; i++) {
        if (_this.currentTreeData[i].projectId == projectId && _this.currentTreeData[i].projectName == projectName) {
          newTreeData.push(_this.currentTreeData[i]);
          break;
        }
      }
      _this.setState({
        treeData: newTreeData,
        autoExpandParent: true
      });
    } else {
      _this.setState({
        treeData: _this.currentTreeData,
        autoExpandParent: true
      });
    }
  }
}


const CaseDoProjectTree = React.createClass({
  getInitialState() {
    return {
      treeData: [],
      expandedKeys: [],
      loading: false,
      isProject: true,
      autoExpandParent: true,
      isShowAuditModule: false,
    }
  },
  fetch(data) {

    let _this = this;
    this.setState({ loading: true });

    reqwest({
      url: this.props.apiUrl,
      method: 'get',
      type: 'json',
      data: {
        '_id': Storage.local.get(top_current_project) ? Funs.decrypt(Storage.local.get(top_current_project).currentProject, Funs.secret) : null,
        'type': Storage.local.get(top_current_project) ? Storage.local.get(top_current_project).type : null,
        'isShowModule':  (data && data.isShowAuditModule) ? data.isShowAuditModule : false
      },
      success: (result) => {
        if (result.status === 200) {
          let expandedKeys = [];
          if(result.showModule){
            this.props.getModuleId(result.showModule);//传给caseAuditToDoList组件需要展示的模块信息
          }
          
          result.data.forEach(item => {
            if (this.props.openDotNode) {
              if (item.children) {
                let isOpen = false;
                item.children.forEach(child => {
                  //  expandedKeys.push(item._id); //屏蔽二级模块展开功能

                  if (child.dot) {
                    isOpen = true;
                  }
                })
                if (isOpen) {
                  expandedKeys.push(item._id);
                }

                item.children.forEach(child => {
                  if (child.children) {
                    let isOpen = false;
                    child.children.forEach(chi => {
                      if (chi.dot) {
                        isOpen = true;
                      }
                      //start 对于多层级模块，多加了一层判断
                      if(chi.children){
                        let chiIsOpen = false;
                        chi.children.forEach(ci =>{
                          if(ci.dot){
                            chiIsOpen = true;
                          }
                        })
                        if(chiIsOpen){
                          expandedKeys.push(chi._id);
                        }
                      }
                      //end
                    })
                    if (isOpen) {

                      expandedKeys.push(item._id);
                      expandedKeys.push(child._id);
                    }
                  }
                })
              }

            } else {
              expandedKeys.push(item._id);
              //默认不展开下级项目节点
              // if (item.children) {
              //   item.children.forEach(child => {
              //     expandedKeys.push(child._id);
              //   })
              // }
            }
          });

          if (result.data.length == 0) {
            _this.setState({
              loading: false,
              isProject: false
            });
          } else {
            _this.setState({
              expandedKeys: expandedKeys,
              treeData: result.data,
              loading: false
            });
          }
        } else {
          message.error(result.message);
        }
      },
      error: (err) => {
        message.error(err);
      }
    });

  },
  componentWillUnmount() {
    PubSubMsg.unsubscribe('refresh-todo-tree-data');
    PubSubMsg.unsubscribe('refresh-tree-data-expanded-keys');
    PubSubMsg.unsubscribe('refresh-tree-data-shrink');
    PubSubMsg.unsubscribe('get_current_project');
    PubSubMsg.unsubscribe('update_todo_tree');
  },
  componentDidMount() {

    this.fetch();

    const _this = this;
    PubSubMsg.subscribe('update_todo_tree', function (resData) {
      _this.fetch();
    });
    PubSubMsg.subscribe('refresh-todo-tree-data', function (data) {
      if (data) {
        _this.fetch(data);
      } else {
        _this.fetch();
      }

    });
    PubSubMsg.subscribe('refresh-tree-data-shrink', function (data) {
      _this.setState({ expandedKeys: [] });
    });
    PubSubMsg.subscribe('refresh-tree-data-expanded-keys', function (data) {
      let expandedKeys = [..._this.state.expandedKeys];
      let index = expandedKeys.indexOf(data.id);

      if (index > -1) {
        expandedKeys.splice(index, 1);
      } else {
        expandedKeys.push(data.id);
      }
      _this.setState({
        expandedKeys
      })
    });

    PubSubMsg.subscribe('get_current_project', function (resData) {
      _this.fetch();
    });
  },
  onExpand(expandedKeys) {
    this.setState({ expandedKeys, autoExpandParent: false });
  },
  onProjectSelect(v, opt) {
    OnProSelect.onProSelect(this, v, opt);
  },
  render() {

    const loop = data => data.map((item) => {
      // 做开发审核 分配 TAG显示 cyn      
      let flag = false;
      let roleId = item.roleId;
      let title = item.projectName ? item.projectName : item.moduleName;
      if(this.props.apiUrl === '/client/caseAudit/auditModuleTree'){
           flag = ( (roleId == '7' && !item.sdIsComplete) ||(roleId == '8' && !item.pmIsComplete) )?true:false;  // 开发策划审核 全部完成           
           if(flag){
             title = (<Badge dot={true}><span style={{ float: "right", marginLeft: 4 }}>{item.projectName ? item.projectName : item.moduleName} </span></Badge>);
           }
      }
      // let zone =  flag? <Tag className='auditTagCLZ' color="blue"> 待审</Tag> : null;
      
      if (item.dot) {
        title = (<Badge dot={true}><span style={{ float: "right", marginLeft: 4 }}>{item.projectName ? item.projectName : item.moduleName} </span></Badge>);
      }
      if (item.children) {
        if (item.rowType == "module") {
          return (
            <TreeNode key={item._id} title={(<span style={{ color: '#black' }}><Icon type='file' />{title}</span>)} nodeData={item} isLeaf={true} expanded={true} >
              {loop(item.children)}
            </TreeNode>
          );
        } else {
          return (
            <TreeNode key={item._id} title={(<span style={{ color: '#2db7f5' }}><Icon type='folder' />{title}</span>)} nodeData={item} isLeaf={true} expanded={true} >
              {loop(item.children)}
            </TreeNode>
          );
        }
      }

      if (item.rowType == "module") {
        return <TreeNode key={item._id} title={(<sapn style={{ color: '#black' }}><Icon type='file' />{title}</sapn>)} nodeData={item} expanded={true} isLeaf={true} />;
      } else {
        return <TreeNode key={item._id} title={(<sapn style={{ color: '#2db7f5' }}><Icon type='folder' />{title}</sapn>)} nodeData={item} expanded={true} isLeaf={true} />;
      }

    });

    if (this.state.isProject == false) {
      return <Alert message="请联系项目负责人设置成员" type="warning" />
    }
    let style = {
      display: '',
      width: 180
    }

    this.dataProjectSelect = !this.dataProjectSelect || this.dataProjectSelect.length === 0 ?
      (this.props.treeData ? this.props.treeData : this.state.treeData) : this.dataProjectSelect;


    return (
      <div style={{ minHeight: 200 }}>
        {/* <ProjectSelect  onProjectSelect={this.props.onProjectSelect ? this.props.onProjectSelect : this.onProjectSelect}  data={this.dataProjectSelect} style={style}/>*/}
        <Spin spinning={this.state.loading}>
          <Tree showLine defaultExpandAll
            expandedKeys={this.state.expandedKeys}
            onExpand={this.onExpand}
            autoExpandParent={this.state.autoExpandParent}
            onRightClick={this.props.onRightClick}
            onSelect={this.props.onSelect}>
            {loop(this.state.treeData)}
          </Tree>
        </Spin>
      </div>
    );
  }
});

export default CaseDoProjectTree;
