import './style.less';
import React from 'react';
import { Select, message } from 'antd';
import API from '../API';
import Ajax from '../../framework/common/ajax';
const Option = Select.Option;
const OptGroup = Select.OptGroup;

const ProjectSelect = React.createClass({
  getInitialState () {
    return {
      data: []
    };
  },
  componentDidMount () {
  },
  onProjectSelect (val, option) {
    if (this.props.onProjectSelect) {
      this.props.onProjectSelect(val, option);
    }
  },
  render () {
    let style = this.props.style ? this.props.style : {};
    let isAllowClear = this.props.isAllowClear === false ? this.props.isAllowClear : true;
    let optGroupStyle = this.props.optGroupStyle ? this.props.optGroupStyle : {};
    let optGroupLabel = this.props.optGroupLabel === '' ? this.props.optGroupLabel : '显示所有项目';
    
    let emptyOption = '';
    emptyOption = this.props.router === '/client/project' ? <Option key = {'无'} value = {'无--0'} >{'无'}</Option> :
                                <Option style={{ display: 'none' }} key = {'无'} value = {'无--0'} >{'无'}</Option>;

    const options = this.props.data.map(d =>
           <Option key={d.name ? d.name : d.projectName} value={d.name ? d.name + '--' + d.id : d.projectName + '--' + d.projectId}>
              {d.name ? d.name : d.projectName}
           </Option>
      );
    return (
      <Select {...this.props} allowClear={isAllowClear} showSearch
        onSelect={this.onProjectSelect}
        style={style}
        placeholder='请选择项目'
        optionFilterProp='children'
        notFoundContent='无法找到'
        searchPlaceholder='输入项目名'>
        <OptGroup label={optGroupLabel}>
          <Option key={'all'} value={'all'} style={optGroupStyle}>{'所有'}</Option>
        </OptGroup>
        <OptGroup label='项目'>
          {emptyOption}
          {options}
        </OptGroup>
      </Select>
    );
  }
});

export default ProjectSelect;
