import './style.less';
import React from 'react';
import PubSubMsg from '../common/pubsubmsg';

const Container = React.createClass({
  getInitialState() {
    return {
      hidden: false
    }
  },
  componentWillUpdate() {
    //console.log('Container', 'componentWillUpdate');
  },
  componentDidUpdate() {
    //console.log('Container', 'componentDidUpdate');
  },
  componentDidMount() {
    let _this = this;
  },
  render() {
    let style = {
      left: this.state.hidden ? 0 : this.state.collapseSidebar ? 60 : 160
    };
    return (
      <div className="admin-container " style={style}>{this.props.children}</div>
    );
  }
});

export default Container;
