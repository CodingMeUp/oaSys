import './style.case.less';
import React from 'react';
import reqwest from 'reqwest';
import { Alert, Breadcrumb, Menu, Icon, Tree, Tooltip, Spin, Badge, Modal, message } from 'antd'
import { Router, Route, Link, hashHistory } from 'react-router';
import Page from '../../framework/page/Page';
import FAIcon from '../../framework/faicon/FAIcon';
import PubSubMsg from '../../framework/common/pubsubmsg';
import Storage from '../../framework/common/storage';
import Funs from '../../framework/common/functions';
import CaseSpreadsheet from './CaseSpreadsheet';
import API from '../API';
import Ajax from '../../framework/common/ajax';
import ProjectSelect from '../case_do/ProjectSelect';

const TreeNode = Tree.TreeNode;
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const top_current_project = Funs.top_current_project + '_' + _USERINFO.userId;
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


const ProjectTree = React.createClass({
  stateValue: {},
  getInitialState() {
    return {
      treeData: [],
      expandedKeys: [],
      loading: false,
      isProject: true,
      autoExpandParent: true
    }
  },
  fetch(data) {
    let _this = this;
    this.setState({ loading: true })
    reqwest({
      url: this.props.apiUrl ? this.props.apiUrl : API.MODULE_TREE,
      method: 'get',
      data: {
        expandedRows: data ? data : [],
        '_id': Storage.local.get(top_current_project) ? Funs.decrypt(Storage.local.get(top_current_project).currentProject, Funs.secret) : null,
        'type': Storage.local.get(top_current_project) ? Storage.local.get(top_current_project).type : null,
      },
      type: 'json',
      success: (result) => {
        if (result.status === 200) {
          let expandedKeys = [];
          let tempRowKeys = [];
          if (data) {
            result.data.forEach(item => {
              tempRowKeys.push(item._id);
            })
            tempRowKeys.push(data.projectId);
            expandedKeys = tempRowKeys.concat(result.expandedRowKey);
          } else {
            result.data.forEach(item => {
              if (this.props.openDotNode) {
                if (item.children) {
                  let isOpen = false;
                  item.children.forEach(child => {
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
          }

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

           _this.setState({
             loading: false
           });
        } else {
          _this.setState({
             loading: false
           });
          message.error(result.message);
        }
      },
      error: (err) => {
        _this.setState({
             loading: false
           });
        message.error(err);
      }
    });
  },
  componentWillUnmount() {
    PubSubMsg.unsubscribe('refresh-tree-data');
    PubSubMsg.unsubscribe('refresh-tree-data-expanded-keys');
    PubSubMsg.unsubscribe('refresh-tree-data-shrink');
    PubSubMsg.unsubscribe('get_current_project');
  },
  componentDidMount() {
    this.fetch();

    const _this = this;
    PubSubMsg.subscribe('refresh-tree-data', function (data) {
      if (data) {
        _this.fetch(data);
      } else {
        _this.fetch();
      }

    });
    PubSubMsg.subscribe('get_current_project', function (resData) {
      _this.fetch();
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
  },
  onExpand(expandedKeys) {
    this.setState({ expandedKeys, autoExpandParent: false });
  },
  onProjectSelect(v, opt) {
    OnProSelect.onProSelect(this, v, opt);
  },
  onDragEnter(info) {
    //expandedKeys 需要受控时设置
    // this.setState({
    //  expandedKeys: info.defaultExpandAll,
    // });
  },
  onDrop(info) {
    if (info.dragNode.props.nodeData.rowType == "module") {
      const dropKey = info.node.props.eventKey;
      const dragKey = info.dragNode.props.eventKey;
      //add by dwq 新产品逻辑流程
      const isLeaf = info.node.props.nodeData.isLeaf;
      // const dragNodesKeys = info.dragNodesKeys;
      const loop = (data, key, callback) => {
        data.forEach((item, index, arr) => {
          if (item.key === key) {
            return callback(item, index, arr);
          }
          if (item.children) {
            return loop(item.children, key, callback);
          }
        });
      };
      const data = [...this.state.treeData];
      let dragObj;
      let type = Storage.local.get(top_current_project) ? Storage.local.get(top_current_project).type : null;

      //add by dwq 新产品逻辑流程
      if (type == "product") {
        if ((isLeaf == true) ||(info.node.props.nodeData.rowType=="module")) {
        loop(data, dragKey, (item, index, arr) => {
          arr.splice(index, 1);
          dragObj = item;
        });
        if (info.dropToGap) {
          let ar;
          let i;
          loop(data, dropKey, (item, index, arr) => {
            ar = arr;
            i = index;
          });
          ar.splice(i, 0, dragObj);
        } else {
          loop(data, dropKey, (item) => {
            item.children = item.children || [];
            // where to insert 示例添加到尾部，可以是随意位置
            item.children.push(dragObj);
          });
        }
        // this.setState({
        //   treeData: data,
        // });
        Modal.confirm({
          title: '您是否确认要移动【' + info.dragNode.props.nodeData.moduleName + "】模块？",
          content: <div style={{ color: "red", fontWeight: "bold" }}>请慎重！！！<br />移动模块会一并移动子模块以及用例。</div>,
          okText: '确定',
          cancelText: '取消',
          onOk() {
            Ajax.get({
              url: API.PROJECT_MODULEMOVE_GET,
              data: {
                _id: dragKey,
                projectId: info.node.props.nodeData.projectId,
                rowType: info.node.props.nodeData.rowType,
                parentId: dropKey,
                //add by dwq for 新产品流程添加字段
                'productId': Storage.local.get(top_current_project) ? Funs.decrypt(Storage.local.get(top_current_project).currentProject, Funs.secret) : null,
                'type': Storage.local.get(top_current_project) ? Storage.local.get(top_current_project).type : null,
                //add end
              },
              success: (result) => {
                // _this.stateValue = {};
                PubSubMsg.publish('refresh-tree-data', { projectId: info.node.props.nodeData.projectId, rowId: info.node.props.eventKey });
                message.success('移动完成', 2);
              }
            });
          },
          onCancel() {
              //PubSubMsg.publish('refresh-tree-data', { projectId: info.dragNode.props.nodeData.projectId});
              PubSubMsg.publish('refresh-tree-data', { projectId: info.dragNode.props.nodeData.projectId, rowId: dragKey });
              message.success('取消移动', 2);
          }
        });

      } else {
        message.warning("与PMS匹配的项目，无法拖动模块到非叶子节点~");
      }

      } else {
        loop(data, dragKey, (item, index, arr) => {
          arr.splice(index, 1);
          dragObj = item;
        });
        if (info.dropToGap) {
          let ar;
          let i;
          loop(data, dropKey, (item, index, arr) => {
            ar = arr;
            i = index;
          });
          ar.splice(i, 0, dragObj);
        } else {
          loop(data, dropKey, (item) => {
            item.children = item.children || [];
            // where to insert 示例添加到尾部，可以是随意位置
            item.children.push(dragObj);
          });
        }
        // this.setState({
        //   treeData: data,
        // });
        Modal.confirm({
          title: '您是否确认要移动【' + info.dragNode.props.nodeData.moduleName + "】模块？",
          content: <div style={{ color: "red", fontWeight: "bold" }}>请慎重！！！<br />移动模块会一并移动子模块以及用例。</div>,
          okText: '确定',
          cancelText: '取消',
          onOk() {
            Ajax.get({
              url: API.PROJECT_MODULEMOVE_GET,
              data: {
                _id: dragKey,
                projectId: info.node.props.nodeData.projectId,
                rowType: info.node.props.nodeData.rowType,
                parentId: dropKey,
                //add by dwq for 新产品流程添加字段
                'productId': Storage.local.get(top_current_project) ? Funs.decrypt(Storage.local.get(top_current_project).currentProject, Funs.secret) : null,
                'type': Storage.local.get(top_current_project) ? Storage.local.get(top_current_project).type : null,
                //add end
              },
              success: (result) => {
                // _this.stateValue = {};
                PubSubMsg.publish('refresh-tree-data', { projectId: info.node.props.nodeData.projectId, rowId: info.node.props.eventKey });
                message.success('移动完成', 2);
              }
            });
          },
          onCancel() {
            PubSubMsg.publish('refresh-tree-data', { projectId: info.dragNode.props.nodeData.projectId, rowId: dragKey });
            message.success('取消移动', 2);
          }
        });
      }


    } else {
      message.warning('项目无法移动', 3);
    }
  },
  render() {

    const loop = data => data.map((item) => {

      if (item.children && item.children.length) {
        if (item.rowType == "module") {
          return (
            <TreeNode key={item._id} title={(<span style={{ color: '#black' }}><Icon type='file' /> {item.projectName ? item.projectName : item.moduleName}</span>)} nodeData={item} isLeaf={true} expanded={true} >
              {loop(item.children)}
            </TreeNode>
          );
        } else {
          return (
            <TreeNode key={item._id} title={(<span style={{ color: '#2db7f5' }}><Icon type='folder' /> {item.projectName ? item.projectName : item.moduleName}</span>)} nodeData={item} isLeaf={true} expanded={true} >
              {loop(item.children)}
            </TreeNode>
          );
        }
      }
      let title = item.projectName ? item.projectName : item.moduleName;
      if (item.dot) {
        title = (<Badge dot={true}><span style={{ marginRight: 6 }}>{item.projectName ? item.projectName : item.moduleName} </span></Badge>);
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
        {/*<ProjectSelect onProjectSelect={this.props.onProjectSelect ? this.props.onProjectSelect : this.onProjectSelect} data={this.dataProjectSelect} style={style} />*/}
        <Spin spinning={this.state.loading}>
          <Tree showLine defaultExpandAll
            expandedKeys={this.state.expandedKeys}
            onExpand={this.onExpand}
            autoExpandParent={this.state.autoExpandParent}
            onRightClick={this.props.onRightClick}
            onSelect={this.props.onSelect}
            draggable
            onDragEnter={this.onDragEnter}
            onDrop={this.onDrop}>
            {loop(this.state.treeData)}
          </Tree>
        </Spin>
      </div>
    );
  }
});

export default ProjectTree;
