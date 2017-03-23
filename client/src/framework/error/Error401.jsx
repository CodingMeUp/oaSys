import './style.less';
import React from 'react';
import { Breadcrumb, Button, Alert, Tag, Icon } from 'antd'
import { Link } from 'react-router'
import createBrowserHistory from 'history/lib/createBrowserHistory'
const browserHistory = createBrowserHistory();
import Storage from '../../framework/common/storage';
export default React.createClass({
  goBack() {
    browserHistory.goBack()
  },
  render() {
    let header =
      <div>
        <h1 className="admin-page-header-title">无权限访问</h1>
        <Breadcrumb>
          <Breadcrumb.Item>
            <Icon type="home" />
            首页
          {/*<Link to="/">首页</Link>*/}
          </Breadcrumb.Item>
          <Breadcrumb.Item>无权限访问</Breadcrumb.Item>
        </Breadcrumb>
      </div>;

    return (
      <div header={header}>
        <div id="admin-page-header" className="admin-page-header">

        </div>
        <Alert
          message="亲，该页面您无权限访问哦~"
          description={pageName}
          type="info"
          showIcon />
        <Button onClick={this.goBack}><a href="javascript:;">返回上一级</a></Button>
        <Button> <Link to="/">返回首页</Link></Button>
      </div >
    );
  }
});
