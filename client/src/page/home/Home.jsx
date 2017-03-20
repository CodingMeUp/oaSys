import './style.css';
import React from 'react';
import { Breadcrumb } from 'antd'
import Page from '../../framework/page/Page';

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
        <h1 className="admin-page-header-title">用例管理平台</h1>
        <Breadcrumb>
          <Breadcrumb.Item>
            <Icon type="home" />
            首页
          </Breadcrumb.Item>
          <Breadcrumb.Item>面板</Breadcrumb.Item>
        </Breadcrumb>
      </div>;
      
    return (
      <Page header={pageHeader} loading={this.state.loading}>
        <div>
          
        </div>
      </Page>
    );
  }
});

export default Home;
