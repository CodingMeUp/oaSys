import './style.less';
import React from 'react';
import { Breadcrumb, Button, Alert } from 'antd'
import {Link} from 'react-router'
import createBrowserHistory from 'history/lib/createBrowserHistory'
const browserHistory = createBrowserHistory();
import Page from '../page/Page';

export default React.createClass({
  goBack() {
    browserHistory.goBack()
  },
  render() {
    let header =
      <div>
        <h1 className="admin-page-header-title">页面已丢失</h1>
        <Breadcrumb>
          <Breadcrumb.Item><Link to="/">首页</Link></Breadcrumb.Item>
          <Breadcrumb.Item>页面已丢失</Breadcrumb.Item>
        </Breadcrumb>
      </div>;
    return (
      <Page header={header}>
        <div id="admin-page-header" className="admin-page-header">

        </div>
        <Alert
          message="亲, Error 404"
          description="您访问的页面不存在~"
          type="info"
          showIcon />
        <Button onClick={this.goBack}><a href="javascript:;">返回上一级</a></Button>
        <Button> <Link to="/">返回首页</Link></Button>
      </Page>
    );
  }
});
