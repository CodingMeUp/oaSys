import React from 'react';
import {Pagination} from 'antd';
import classNames from 'classnames';
/**@add by Qiang on 2016/04/20
 * @description 表格分页组件
 * @param pageSize  每页条数[Number][必须]
 * @param total  数据总数[Number][必须]
 * @param currentPage  当前页[Number][必须]
 * @param position 组件显示位置[String]
 * @param display  是否显示组件[String]
 * @return onPageChange 回调父组件方法进行刷新数据
 */
const ExcelPagination = React.createClass({
  propTypes: {
    total: React.PropTypes.number.isRequired,
    pageSize: React.PropTypes.number.isRequired,
    currentPage: React.PropTypes.number.isRequired,
    position: React.PropTypes.string,
    display: React.PropTypes.string
  },
  onChange(page) {
    if (this.props.onPageChange) {
      this.props.onPageChange(page);
    }
  },
  showTotal(total){
    return `共 ${total} 条`;
  }
  ,
  render() {
    return (
      <div className={this.props.position} style={{ display: this.props.style }}>
        <Pagination showTotal={this.showTotal} pageSize={this.props.pageSize} current={this.props.currentPage} 
          onChange={this.onChange} total={this.props.total}/>
      </div>
    );
  }
});
export default ExcelPagination;