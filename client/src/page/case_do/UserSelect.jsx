import './style.less';
import React from 'react';
import { Select, message } from 'antd'
import API from '../API';
import Ajax from '../../framework/common/ajax';
import Storage from '../../framework/common/storage';
const Option = Select.Option;
const OptGroup = Select.OptGroup;

const UserSelect = React.createClass({
  getInitialState() {
    return {
      data: [],
      localUsers: []
    }
  },
  fetch(option) {
    const localUserSelect = Storage.local.get('userSelect');
    let users = localUserSelect ? localUserSelect : [];    
    let _this = this;
    if (!this.props.data) {
      let _this = this;
      Ajax.get({
        url: API.USER_ALL_LIST,
        data: option ? option : {},
        success(res) {
          const result = res.body;

          if (result.status === 200) {
            _this.setState({
              data: result.data, 
              localUsers: users
            });
          } else {
            message.error(result.message);
          }
        }
      })
    } else {
      let data = [...this.props.data];
      if (option) {
        let keyword = option.keyword;
        
        data = data.filter(item => {
          return item.nick_name.indexOf(keyword) === 0 || item.nick_name_short.indexOf(keyword) === 0 || item.nick_name_full.indexOf(keyword);
        })
      } else {
        if (this.props.filterByDep) {
          data = data.filter(item => {
            return window._USERINFO.sdepcode.length > 0 && item.personInfo && item.personInfo.sdepcode.indexOf(window._USERINFO.sdepcode) === 0;
          })
        } 
      }
      
      _this.setState({
        data: data,
        localUsers: users
      });
    }
  },
  componentDidMount() {
    this.fetch();
  },
  onSelect(val, option) {
    const key = 'userSelect';
    const localUserSelect = Storage.local.get(key);
    let users = localUserSelect ? localUserSelect : [];
    let isHave = false;
    users.forEach(item => {
      if (item._id == val) {
        isHave = true;
      }
    })

    if (!isHave) {
      const nick_name = option.props.children.split('(')[0];
      users.push({ _id: val, nick_name: nick_name });
      if (users.length > 10) {
        Storage.local.set(key, users.slice(0, 10));
      } else {
        Storage.local.set(key, users);
      }
    }
    
    if (this.props.onSelect) {
      this.props.onSelect(val, option);
    }
  },
  onSearch(e) {
    if (this.props.data) {
      this.fetch({
        keyword: e
      });
    }
  },
  render() {
    const options = this.state.data.map(d => <Option searchValue={d.nick_name_short + '_' + d.nick_name_full + '_'  + d.nick_name + '(' + d._id + ')'} key={d._id} value={d._id}>{d.nick_name + '(' + d._id + ')'}</Option>);
    const optionsLocal = this.state.localUsers.map(d => <Option key={d.nick_name + d._id} value={d._id}>{d.nick_name + '(' + d._id + ')'}</Option>);
    
    const style = this.props.style ? this.props.style : {width: 200};
    return (
      <Select {...this.props} allowClear showSearch
        onSelect={this.onSelect}
        onSearch={this.onSearch}
        style={style}
        placeholder="请选择人员"
        optionFilterProp="searchValue"
        notFoundContent="无法找到"
        searchPlaceholder="输入姓名/工号/拼音">
        <OptGroup key="local" label="近期选择过的">
          {optionsLocal}
        </OptGroup>
        <OptGroup key="qalist" label="QA人员">
        {options}
        </OptGroup>
      </Select>
    );
  },
});

export default UserSelect;