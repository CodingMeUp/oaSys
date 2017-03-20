import React from 'react';
import { Icon, Input, Button } from 'antd';
import classNames from 'classnames';
const InputGroup = Input.Group;

const SearchInput = React.createClass({
  getInitialState() {
    return {
      value: '',
      focus: false
    };
  },
  handleInputChange(e) {
    this.setState({
      value: e.target.value,
    });
  },
  handleFocusBlur(e) {
    this.setState({
      focus: e.target === document.activeElement,
    });
  },
  handleSearch() {
    this.state.value = this.state.value.replace(/[[&\|\\\*^%?$()#@\-]/g,"");
    if (this.props.onSearch) {
      this.props.onSearch(this.state.value,this.state.focus);
    }
  },
  KeyDown(e){
    if(e.keyCode==13){
       this.setState({
          value: e.target.value,
        });
       this.handleSearch();
    }
  },
  render() {
    const btnCls = classNames({
      'ant-search-btn': true,
      'ant-search-btn-noempty': !!this.state.value.trim(),
    });
    const searchCls = classNames({
      'ant-search-input': true,
      'ant-search-input-focus': this.state.focus,
    });
    return (
      <InputGroup className={searchCls} style={this.props.style}>
        <Input {...this.props} value={this.state.value}  onKeyDown={this.KeyDown}  onChange={this.handleInputChange}
          onFocus={this.handleFocusBlur} onBlur={this.handleFocusBlur} />
        <div className="ant-input-group-wrap">
          <Button className={btnCls} onClick={this.handleSearch}>
            <Icon type="search" />
          </Button>
        </div>
      </InputGroup>
    );
  }
});

export default SearchInput;