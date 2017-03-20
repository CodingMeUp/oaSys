import './style.less';
import React from 'react';
import reqwest from 'reqwest';
import { TreeSelect, message } from 'antd'
import API from '../API';

const TreeNode = TreeSelect.TreeNode;

const ModuleSelectTree = React.createClass({
  getInitialState() {
    return {
      treeData: []
    }
  },
  componentDidMount() {
    let _this = this;
    reqwest({
      url: API.MODULE_TREE,
      method: 'get',
      type: 'json',
      success: (result) => {
        if (result.status === 200) {
          _this.setState({
            treeData: result.data
          });
        } else {
          message.error(result.message);
        }
      },
      error: (err) => {
        message.error(err);
      }
    });
  },
  render() {
    return (
      <TreeSelect style={{ width: 300 }}
        treeData={this.state.treeData}
        dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
        placeholder="请选择"
        allowClear
        multiple
        treeCheckable
        showSearch={true}
        treeDefaultExpandAll>

      </TreeSelect>
    );
  },
});

export default ModuleSelectTree;