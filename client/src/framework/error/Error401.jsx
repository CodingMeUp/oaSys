import './style.less';
import React from 'react';
import { Breadcrumb, Button, Alert, Tag, Icon } from 'antd'
import { Link } from 'react-router'
import createBrowserHistory from 'history/lib/createBrowserHistory'
const browserHistory = createBrowserHistory();
import Page from '../page/Page';
import Storage from '../../framework/common/storage';
const top_project_hash = 'hash_' + _USERINFO.userId;
export default React.createClass({
  goBack() {
    browserHistory.goBack()
  },
  render() {
    //配置无权限详情页面 add by  dwq
    const pathNameJson = {
      "/project": "项目管理",
      "/projectModule": "模块管理",
      "/projectAuth": "成员设置"
    };
    let pathName = Storage.local.get(top_project_hash) ? Storage.local.get(top_project_hash) : "";
    let pageName;
    if (pathName == "") {
      pageName = "您还没有访问该页面权限, 请联系测试负责人或导航12580工作人员。";
    } else {
      let temp = pathName.split("#");
      if (pathNameJson['' + temp[1] + '']) {
        pageName = "您还没有访问该【" + pathNameJson['' + temp[1] + ''] + "】页面权限, 请联系测试负责人或导航12580工作人员。";
      } else {
        pageName = "您还没有访问该页面权限, 请联系测试负责人或导航12580工作人员。";
      }
    }
    //add end
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
      <Page header={header}>
        <div id="admin-page-header" className="admin-page-header">

        </div>
        <Alert
          message="亲，该页面您无权限访问哦~"
          description={pageName}
          type="info"
          showIcon />
        <Button onClick={this.goBack}><a href="javascript:;">返回上一级</a></Button>
        <Button> <Link to="/">返回首页</Link></Button>
      </Page >
    );
  }
});
