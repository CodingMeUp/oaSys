import './style.less';
import React from 'react';
import { Button, Icon, message, Dropdown, Menu, Modal, Tag } from 'antd'
import CaseDoResult from './CaseDoResult';
import API from '../API';
import Storage from '../../framework/common/storage';
import Funs from '../../framework/common/functions';


/**
 * 用例执行记录
 */
const top_current_project = Funs.top_current_project +'_'+_USERINFO.userId;

const CaseDoHistorySelect = React.createClass({
  getInitialState() {
    return {
      data: [],
      visible : false,
      key:''
    }
  },
  componentDidMount() {

  },
  onClick: function ({ key }) {
    Modal.info({
      title: '用例执行结果',
      width: '96%',
      content: (
        <CaseDoResult moduleId={this.props.moduleId} doCaseId={key} />
      ),
      onOk() { },
      onCancel(){ }
    });
    // this.doCaseId = key;
    // this.setState({
    //   visible : true,
    //   key: key
    // })
  },
  handleCancel(){
    this.setState({
      visible : false
    })
  }
  ,
  render() {
    const menuItem = this.props.menuData.map((item, index) => {
      var type = Storage.local.get(top_current_project) ?Storage.local.get(top_current_project).type:null;
      let strArr = [];
      if(type && type == "product"){
        strArr.push('子项目：' + item.ztModuleName);
        strArr.push('版本：' + item.version);
        if (item.env) {
          strArr.push('环境：' + item.env);
        }
        strArr.push('轮数：（' + item.times + '）');

      }else{
        strArr.push('版本：' + item.version);
        if (item.env) {
          strArr.push('环境：' + item.env);
        }
        strArr.push('轮数：（' + item.times + '）');
      }

      let str = (<a>{strArr.join('，')}</a>);

      return (<Menu.Item key={item._id}>
        {str}
      </Menu.Item>);
    });
    const menu = (
      <Menu style={{ overflow: 'auto', maxHeight: 300 }} onClick={this.onClick}>
        {menuItem}
      </Menu>
    );


    const totalTimes = this.props.menuData.length;
    return (
      <div>
        <Dropdown overlay={menu} trigger={['hover']}>
          <a className="ant-dropdown-link">
            查看用例执行记录 <Tag color="blue">{totalTimes}</Tag> <Icon type="down" />
          </a>
        </Dropdown>
      </div>
    );
  },
});

export default CaseDoHistorySelect;