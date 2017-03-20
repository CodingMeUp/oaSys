import './style.case.spreadsheet.less';
import React from 'react';
import {Tree, Modal, Button, Menu, Icon, InputNumber, message } from 'antd'
import reqwest from 'reqwest';
import * as _ from 'lodash';
import PubSubMsg from '../../framework/common/pubsubmsg';
import FAIcon from '../../framework/faicon/FAIcon';
import API from '../API';
import $ from '../../framework/common/jquery-2.1.1.min';
const TreeNode = Tree.TreeNode;

const ConfigTableBtn = React.createClass({
  defaultConfig: {
    defcolHeaders: ['记录', '子模块', '用例标题', '前提', '步骤', '步骤描述', '期待结果', '优先级', '编写人', '编写日期', 'QA审核结果', '开发审核结果','策划审核结果','审核结果备注', '备注'],
    lockCol: 0,
    newcolums: []
  },
  getInitialState() {
    return {
      visible: false,
      gData: [],
      checkedKeys: []
    }
  },
  componentDidMount() {

    let _this = this;
    reqwest({
      url: API.CASE_USERCONFIG,
      method: 'get',
      type: 'json',
      success: (result) => {        
        let userConfig = result.userConfig[0].userConfig;        
        let checkedKeys = [];
        let customColHeaders = userConfig.customColHeadersNew.length > 0 ? userConfig.customColHeadersNew : this.defaultConfig.defcolHeaders;//若数据库未配置，取默认值                
        let unVisibleCol = userConfig.unVisibleColNew;
        let gData = [];
        this.defaultConfig.lockCol = result.userConfig[0].userConfig_fixedColumnsLeft;

        for (let i = 0; i < customColHeaders.length; i++) {
          if (unVisibleCol.indexOf(customColHeaders[i]) < 0) {
            checkedKeys.push(i + '');
          }

          gData.push({
            text: customColHeaders[i],
            key: i
          })
        }


        _this.setState({
          gData: gData,
          checkedKeys: checkedKeys
        });
      },
      error: (err) => {
        message.error(err);
      }
    });
  },
  handleButtonClick() {
    let _this = this;    
    if(window.isNeedSave && _this.props.excelTableHasChange(false)){
      message.error("请先保存用例后再进行配置！",3);
    }else{
      this.setState({
      visible: true
    });
    }

  },
  handleMenuClick(e) {
    console.log(e);
  },
  handleOk() {
    let _this = this;
    let checkedKeys = this.state.checkedKeys; //显示的列 KEY
    let gData = this.state.gData; // 最后的排序
    let unVisibleCol = [], customColHeaders = [];
    
    gData.forEach(item => {
      if (checkedKeys.indexOf(item.key + '') < 0) {
        unVisibleCol.push(item.text);
      }

      customColHeaders.push(item.text);
    })    
    _this.defaultConfig.newcolums = [];
    
    if (customColHeaders) {
      for (let i = 0; i < customColHeaders.length; i++) {        
        for (let j = 0; j < _this.props.defcolums.length; j++) {          
          if (_this.props.defcolums[j].header == customColHeaders[i]) {
            _this.defaultConfig.newcolums.push(_this.props.defcolums[j]);
          }
        }
      }
    }
    
    //获取移动后排列数据        
    var options = {
      colHeaders: customColHeaders,
      columns: _this.defaultConfig.newcolums
    };    
    $.post('/manage/user/config', { data: JSON.stringify({ fixedColumnsLeft: this.defaultConfig.lockCol, unVisibleColNew: unVisibleCol, customColHeadersNew: customColHeaders }) }, function (data, status) {
      _this.props.userConfig(options);    //更新hotTable数据显示            
    });


    this.setState({
      visible: false
    });
    message.success('保存成功', 2);
  },
  handleCancel(e) {
    this.setState({
      visible: false
    });
  },
  onDrop(info) {
    const dropKeyCheck = info.node.props.checked;
    const dragKeyCheck = info.dragNode.props.checked;

    const dropKey = info.node.props.eventKey;
    const dragKey = info.dragNode.props.eventKey;

    if (parseInt(dropKey) < 1) { // 第一列不允许调放位置操作 
      return false;
    }

    const dropnodeData = info.node.props.nodeData;
    //通用栏位不允许调换位置
    if(dropnodeData == '' || dropnodeData =='子模块' || dropnodeData == '用例标题' || dropnodeData =='前提' || dropnodeData =='步骤' || dropnodeData=='步骤描述' || dropnodeData =='期待结果'){
      return false;
    }  

    let gData = [...this.state.gData];
    let checkedKeys = [...this.state.checkedKeys];
    let keys = [];


    let dropKeyIndex, dragKeyIndex, dropItem, dragItem;
    let index = 0;
    gData.forEach(item => {
      var key = (item.key + _.random(10000)) + '';

      if (item.key == dropKey) {
        dropKeyIndex = index;
        dropItem = item;
        if (dropKeyCheck) {
          keys.push(dropKey);
        }
      } else if (item.key == dragKey) {
        dragKeyIndex = index;
        dragItem = item;

        if (dragKeyCheck) {
          keys.push(dragKey);
        }
      } else {
        if (checkedKeys.indexOf(item.key + '') >= 0) {
          keys.push(key);
          item.key = key;
        }
      }

      index++;
    });


    gData[dropKeyIndex] = dragItem;
    gData[dragKeyIndex] = dropItem;


    this.setState({
      gData: gData,
      checkedKeys: keys
    })
  },
  onCheck(checkedKeys) {
    this.setState({
      checkedKeys
    });
  },
  onChange(value) {
    this.defaultConfig.lockCol = value;
  },
  render() {
    const loop = data => data.map((item, index) => {           
      if (index < 7) {
        //子模块、前提、步骤允许勾选
        if(index == 1 || index == 3 || index == 4){
          return <TreeNode key={item.key} title={item.text} nodeData={item.text} isLeaf={true} />;
        }else{
         return <TreeNode key={item.key} title={item.text} nodeData={item.text} isLeaf={true} disabled />; 
        }        
      } else {
        return <TreeNode key={item.key} title={item.text} nodeData={item.text} isLeaf={true} />;
      }
    });
    return (
      <span>
        <Modal id="excelTableConfigModal" title="表格配置" maskClosable={false} visible={this.state.visible}
          onOk={this.handleOk} onCancel={this.handleCancel} >
          <div>
            <section>
              <label className="label">锁定列(比如要锁定第一列输入 1 ， 不锁定输入 0) ：</label>
              <label className="input">
                <InputNumber name="lockCol" id="lockCol" onChange={this.onChange} min={0} max={14} defaultValue={this.defaultConfig.lockCol} />
              </label>
            </section>
            <section>
              <label className="label">选择要显示的列</label>
              <div>
                <Tree onDrop={this.onDrop}
                  checkedKeys={this.state.checkedKeys}
                  onCheck={this.onCheck}
                  checkable
                  draggable={true}>
                  {loop(this.state.gData) }
                </Tree>
              </div>
            </section>
          </div>
        </Modal>
        <Button onClick={this.handleButtonClick} type="primary" className="rightBtn">
          <FAIcon  type="fa-gear" /> 表格配置
        </Button>
      </span>
    );
  }
});

export default ConfigTableBtn;
