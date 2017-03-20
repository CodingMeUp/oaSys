import './style.less';
import React from 'react';
import reqwest from 'reqwest';
import { Select, message } from 'antd'
import API from '../API';
import Storage from '../../framework/common/storage';
const Option = Select.Option;
const OptGroup = Select.OptGroup;

const UserComboSelect = React.createClass({
  getInitialState() {
    return {
      data: [],
      localUsers: []
    }
  },
  componentDidMount() {
    const localUserSelect = Storage.local.get('userSelect');
    let users = localUserSelect ? localUserSelect : [];
    
    let _this = this;
    if (!this.props.data) {
      reqwest({
        url: API.USER_ALL_LIST,
        method: 'get',
        type: 'json',
        success: (result) => {
          if (result.status === 200) {
            _this.setState({
              data: result.data, 
              localUsers: users
            });
          } else {
            message.error(result.message);
          }
        },
        error: (err) => {
          message.error(err);
        }
      });
    } else {
      _this.setState({
        data: this.props.data,
        localUsers: users
      });
    }
    
    
  },
  render() {
    const options = this.state.data.map(d => <Option searchValue={d.nick_name_short + '_' + d.nick_name_full + '_'  + d.nick_name + '(' + d._id + ')'} key={d._id} value={d._id}>{d.nick_name + '(' + d._id + ')'}</Option>);
    const optionsLocal = this.state.localUsers.map(d => <Option key={d.nick_name + d._id} value={d._id}>{d.nick_name + '(' + d._id + ')'}</Option>);
    return (
      <Select {...this.props}  allowClear multiple={true}  onChange={this.props.onChange} showSearch
        style={{ width:580 }}
        placeholder="请选择人员"
        optionFilterProp="searchValue"
        notFoundContent="无法找到"
        searchPlaceholder="输入姓名/工号/拼音">
        <OptGroup key="local" label="近期选择过的">
          {optionsLocal}
        </OptGroup>
        <OptGroup key="opt" label="QA人员">
        {options}
        </OptGroup>
      </Select>
    );
  },
});

export default UserComboSelect;