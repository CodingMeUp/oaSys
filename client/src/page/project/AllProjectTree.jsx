import '../case/style.case.less';
import React from 'react';
import reqwest from 'reqwest';
import {Alert, Breadcrumb, Menu, Icon, Button,Tree, Tooltip, Spin, Badge,Modal, message } from 'antd'
import { Router, Route, Link, hashHistory } from 'react-router';
import Page from '../../framework/page/Page';
import FAIcon from '../../framework/faicon/FAIcon';
import PubSubMsg from '../../framework/common/pubsubmsg';
import API from '../API';
import Ajax from '../../framework/common/ajax';
import ProjectSelect from '../case_do/ProjectSelect';

const TreeNode = Tree.TreeNode;
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

var newTreeData=[];
export const OnProSelect = {
  onProSelect: function (_this, v, opt) {
    _this.currentTreeData = !_this.currentTreeData ? [..._this.state.treeData] : _this.currentTreeData;
    if (v != 'all') {
      const projectName = v.split('--')[0];
      const projectId = v.split('--')[1];
      for (var i = 0; i < _this.currentTreeData.length; i++) {
        if (_this.currentTreeData[i].projectId == projectId && _this.currentTreeData[i].projectName == projectName) {
          newTreeData.push(_this.currentTreeData[i]);
          break;
        }
      }
      _this.setState({
        treeData: newTreeData,
        projectName:projectName,
        projectId:projectId,
        treeStyle :{ display : ''},
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


const AllProjectTree = React.createClass({
  stateValue: {},
  getInitialState() {
    return {
      treeData: [],
      projectName:'',
      projectId:'',
      expandedKeys: [],
      loading: false,
      isProject: true,
      autoExpandParent: true,
      treeStyle: {
        display : 'none'
      }
    }
  },
  fetch(data) {
    let _this = this;
    this.setState({ loading: true })
    reqwest({
      url: API.ALL_MODULE_TREE,
      method: 'get',
      data: {expandedRows:data?data.rowId:""},
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
            expandedKeys =  tempRowKeys.concat(result.expandedRowKey);
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
    PubSubMsg.unsubscribe('refresh-tree-data');
    PubSubMsg.unsubscribe('refresh-tree-data-expanded-keys')
    PubSubMsg.unsubscribe('refresh-tree-data-shrink')
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
    // PubSubMsg.subscribe('refresh-tree-data-shrink', function (data) {
    //   _this.setState({ expandedKeys: [] });
    // });
    // PubSubMsg.subscribe('refresh-tree-data-expanded-keys', function (data) {
    //   let expandedKeys = [..._this.state.expandedKeys];
    //   let index = expandedKeys.indexOf(data.id);

    //   if (index > -1) {
    //     expandedKeys.splice(index, 1);
    //   } else {
    //     expandedKeys.push(data.id);
    //   }
    //   _this.setState({
    //     expandedKeys
    //   })
    // });
  },
  onExpand(expandedKeys) {
    this.setState({ expandedKeys, autoExpandParent: false });
  },
  onProjectSelect(v, opt) {
    OnProSelect.onProSelect(this, v, opt);
  },
  deleteBtnClick(){
    let _this = this;
    if(this.state.projectName && this.state.projectId){
      reqwest({
        url: API.DELETE_CASEMNG_PROJECT,
        method: 'get',
        data: {'projectId':this.state.projectId},
        type: 'json',
        success: (result) => {
          if(result.data === 'ok'){
              message.info(`成功删除${this.state.projectName}`);
          }else{
              message.error(`删除${this.state.projectName}失败`);
              console.log({'projectId':this.state.projectId});
          }
        }
      });
    }else{
         message.error('删除的名称或者ID为空');
    }
  },
  render() {

    const loop = data => data.map((item) => {
      if (item.children && item.children.length) {
        if (item.rowType == "module") {
          return (
            <TreeNode key={item._id} title={(<span style={{ color: '#black' }}><Icon type='file'/> {item.projectName ? item.projectName : item.moduleName}</span>) } nodeData={item} isLeaf={true} expanded={true} >
              {loop(item.children) }
            </TreeNode>
          );
        } else {
          return (
            <TreeNode key={item._id} title={(<span style={{ color: '#2db7f5' }}><Icon type='folder'/> {item.projectName ? item.projectName : item.moduleName}</span>) } nodeData={item} isLeaf={true} expanded={true} >
              {loop(item.children) }
            </TreeNode>
          );
        }
      }
      let title = item.projectName ? item.projectName : item.moduleName;
      if (item.dot) {
        title = (<Badge dot={true}><span style={{ marginRight: 6 }}>{item.projectName ? item.projectName : item.moduleName} </span></Badge>);
      }
      if (item.rowType == "module") {
        return <TreeNode key={item._id} title={(<sapn style={{ color: '#black' }}><Icon type='file'/>{title}</sapn>) } nodeData={item} expanded={true} isLeaf={true} />;
      } else {
        return <TreeNode key={item._id} title={(<sapn style={{ color: '#2db7f5' }}><Icon type='folder'/>{title}</sapn>) } nodeData={item} expanded={true} isLeaf={true} />;
      }

    });
    if (this.state.isProject == false) {
      return <Alert message="请联系项目负责人设置成员" type="warning" />
    }
    let style = {
      display: '',
      width: 350
    }

    this.dataProjectSelect = !this.dataProjectSelect || this.dataProjectSelect.length === 0 ?
      (this.props.treeData ? this.props.treeData : this.state.treeData) : this.dataProjectSelect;

    return (
      <div style={{ minHeight: 200 }}>
        <ProjectSelect  onProjectSelect={this.onProjectSelect} optGroupStyle={{display:'none'}} data={this.dataProjectSelect} style={style}/>
       <Button  style={{marginLeft : 20}} type='ghost'  onClick={this.deleteBtnClick}>
                                  {`删除用例平台项目${this.state.projectName?`-【${this.state.projectName}】`:''}`}
        </Button>
        <p>匹配完成的项目删除(~大P isDelete 'true' ,  Module Cp 不动) 【右侧删除】</p>
        <div style={this.state.treeStyle}>
        <Spin spinning={this.state.loading} >
          <Tree 
            showLine 
            defaultExpandAll 
            checkable
            expandedKeys={this.state.expandedKeys}
            onExpand={this.onExpand}
            autoExpandParent={this.state.autoExpandParent}
            onRightClick={this.props.onRightClick}
            onCheck={this.props.onCheck}
            >
            {loop(this.state.treeData) }
          </Tree>
        </Spin>

        </div>
      </div>
    );
  }
});

export default AllProjectTree;
