import './style.css';
import React from 'react';
import { Breadcrumb,Icon} from 'antd'

let initRequestMixin = {
  getInitialState() {
    return {
      loading: false
    }
  },
  componentWillUnmount: function () {

  },
  componentDidMount() {

  }

};

const Home = React.createClass({
  mixins: [initRequestMixin],
  initRequestUrl: '/dashboard.json',
  initRequestSuccess(res) {
  },
  render() {
    const pageHeader =
      <div>
        <h1 className="admin-page-header-title">库房管理系统平台</h1>
        <Breadcrumb>
          <Breadcrumb.Item>
            <Icon type="home" />
            首页
          </Breadcrumb.Item>
          <Breadcrumb.Item>面板</Breadcrumb.Item>
        </Breadcrumb>
      </div>;

    return (
        <div>
				123
        </div>
    );
  }
});

export default Home;
