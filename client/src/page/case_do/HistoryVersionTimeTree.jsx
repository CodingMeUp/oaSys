import './style.less';
import React from 'react';
import { Alert, Breadcrumb, Menu, Icon, Tree, Tooltip, Spin, Badge, message } from 'antd'
import { Router, Route, Link, hashHistory } from 'react-router';
import PubSubMsg from '../../framework/common/pubsubmsg';
import API from '../API';
import Storage from '../../framework/common/storage';
import Funs from '../../framework/common/functions';
import Ajax from '../../framework/common/ajax';
import ProjectSelect from './ProjectSelect';


const TreeNode = Tree.TreeNode;
const top_current_project = Funs.top_current_project + '_' + _USERINFO.userId;
export const OnProSelect = {
  onProSelect: function (_this, v, opt) {
    _this.currentTreeData = !_this.currentTreeData ? [..._this.state.treeData] : _this.currentTreeData;
    if (v != 'all') {
      const projectName = v.split('--')[0];
      const projectId = v.split('--')[1];
      var newTreeData = [];
      for (var i = 0; i < _this.currentTreeData.length; i++) {
        if (_this.currentTreeData[i].id == projectId && _this.currentTreeData[i].name == projectName) {
          newTreeData.push(_this.currentTreeData[i]);
          break;
        }
      }
      _this.setState({
        treeData: newTreeData,
        treeDataLoading: false,
        autoExpandParent: true
      });
    } else {
      _this.setState({
        treeData: _this.currentTreeData,
        treeDataLoading: false,
        autoExpandParent: true
      });
    }
  }
}

export const HistoryVersionTimeTree = React.createClass({
  getInitialState() {
    return {
      originTreeData: [],
      treeData: [],
      expandedKeys: [],
      treeDataLoading: true,
      autoExpandParent: false
    }
  },
  fetchProjectTreeData() {
    let _this = this;    
    var type = Storage.local.get(top_current_project) ? Storage.local.get(top_current_project).type : null;
    if (type && type == "product") {
      Ajax.get({
        url: API.PROJECT_HISTORY_VERSION_TREE,
        data: {
          'isExpanded': this.props.isExpanded ? 1 : 0,
          '_id': Storage.local.get(top_current_project) ? Funs.decrypt(Storage.local.get(top_current_project).currentProject, Funs.secret) : null,
          'type': type
        },
        before() {
          _this.setState({
            treeDataLoading: true
          })
        },
        success(res) {

          const result = res.body;
          _this.setState({
            originTreeData: result.data.treeData,
            treeData: result.data.treeData,
            treeDataLoading: false,
            expandedKeys: result.data.expandedKeys
          })
        }
      })
    }

  },
  componentWillUnmount() {
    PubSubMsg.unsubscribe('refresh-project-version-tree-data');
    PubSubMsg.unsubscribe('get_current_project');
  },
  componentDidMount() {
    const _this = this;
    PubSubMsg.subscribe('refresh-project-version-tree-data', function (data) {

      _this.fetchProjectTreeData();

    });


    if (!this.props.treeData) {

      this.fetchProjectTreeData();
    }
    PubSubMsg.subscribe('get_current_project', function (resData) {
      _this.fetchProjectTreeData();
    });
  },
  onExpand(expandedKeys) {
    this.setState({ expandedKeys, autoExpandParent: false });
  },
  onProjectSelect(v, opt) {
    OnProSelect.onProSelect(this, v, opt);
  },
  render() {
    this.dataProjectSelect = !this.dataProjectSelect || this.dataProjectSelect.length === 0 ?
      (this.props.treeData ? this.props.treeData : this.state.treeData) : this.dataProjectSelect;
    const loop = data => data.map((item) => {
      if (item.children && item.children.length > 0) {
        const title = (<strong>{item.name}</strong>);
        if (item.type == "project") {
          return (
            <TreeNode key={item.id} title={(<span style={{ color: '#2db7f5' }}><Icon type='folder' />{item.name}</span>)} nodeData={item} isLeaf={true} expanded={true}>
              {loop(item.children)}
            </TreeNode>
          );
        } else {
          return (
            <TreeNode key={item.id} title={item.name} nodeData={item} isLeaf={true} expanded={true} >
              {loop(item.children)}
            </TreeNode>
          );
        }

      } else {
        if (item.type == "project") {
          return <TreeNode key={item.id} title={(<span style={{ color: '#2db7f5' }}><Icon type='folder' />{item.name}</span>)} nodeData={item} expanded={true} isLeaf={true} />;
        } else {
          return <TreeNode key={item.id} title={item.name} nodeData={item} expanded={true} isLeaf={true} />;
        }
      }


    });

    let style = {
      display: '',
      width: 198
    }

    return (
      <div style={{ minHeight: 200 }}>
        <Spin spinning={this.props.treeDataLoading !== undefined ? this.props.treeDataLoading : this.state.treeDataLoading}>
          {/*<ProjectSelect  onProjectSelect={this.props.onProjectSelect ? this.props.onProjectSelect : this.onProjectSelect} data={this.dataProjectSelect} style={style}/>*/}
          <Tree showLine
            autoExpandParent={this.props.autoExpandParent ? this.props.autoExpandParent : this.state.autoExpandParent}
            expandedKeys={this.props.expandedKeys ? this.props.expandedKeys : this.state.expandedKeys}
            onSelect={this.props.onSelect}
            onExpand={this.props.onExpand ? this.props.onExpand : this.onExpand}>
            {loop(this.props.treeData ? this.props.treeData : this.state.treeData)}
          </Tree>
        </Spin>
      </div>
    );
  }
});



