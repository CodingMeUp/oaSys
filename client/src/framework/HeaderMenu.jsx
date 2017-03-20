import React from 'react';
import FAIcon from './faicon/FAIcon';
import { Link } from 'react-router';
import { Menu, Tooltip } from 'antd';
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

/*
 * 数据来源可以是后端动态数据，或者是前端硬编码。
 * */
let headerMenuData = [
  {
    key: 'case',
    icon: 'fa-arrow-circle-o-down',
    text: '用例管理',
    path: '/case',
    children: [{
      key: 'case-edit',
      icon: 'fa-edit',
      text: '  用例编写',
      path: '/case',
    },
    // {
    //     key: 'case-list',
    //     icon: 'fa-binoculars',
    //     text: '  用例浏览',
    //     path: '/case/list',
    //   },
    {
      key: 'case-do',
      icon: 'fa-legal',
      text: '  用例执行',
      path: '/case/do',
    }
      ,
    {
      key: 'case-audit',
      icon: 'fa-check',
      text: '  用例审核',
      path: '/case/audit',
    }
    ]
  },
  {
    key: 'bug',
    icon: 'fa-bug',
    text: 'BUG管理',
    path: '/bug'
  },
  {
    key: 'project',
    icon: 'fa-folder-open-o',
    text: '项目管理',
    path: '/project',
    children: [{
      key: 'project_manage',
      icon: 'fa-folder-open-o',
      text: '  项目管理',
      path: '/project',
    }, {
      key: 'project_module',
      icon: 'fa-file-code-o',
      text: '  模块管理',
      path: '/projectModule',
    },
    {
      key: 'project_auth',
      icon: 'fa-group',
      text: '   成员设置',
      path: '/projectAuth',
    },
    {
      key: 'project_version',
      icon: 'fa-map-signs',
      text: '   版本履历',
      path: '/projectVersion',
    }
      // ,{
      //   key:'project_trans',
      //   icon: 'fa-arrows-h',
      //   text:'  项目匹配',
      //   path:'/projectTransform',
      // }
    ]
  },
  {
    key: 'report',
    icon: 'fa-bar-chart-o',
    text: '数据统计',
    path: '/reports',
    children: [
      {
        key: 'report_project',
        icon: 'fa-cube',
        text: '  项目用例总数',
        path: '/reportproject',
      },

      {
        key: 'reports',
        icon: 'fa-cube',
        text: '  项目报表明细',
        path: '/reports',
      },
      // {
      //   key: 'user_reports',
      //   icon: 'fa-user',
      //   text: '  人员报表明细',
      //   path: '/userReports',
      // }
    ]
  },
  // {
  //   key: 'auth',
  //   icon: 'fa-lock',
  //   text: '用户权限分配',
  //   path: '/userAuthHandle'
  // },
  {
    key: 'self-test',
    icon: 'fa-user-md',
    text: '开发自测',
    path: '/selfTest'
  }

];
/*
 * 获取头部菜单构建完成的jsx数据,直接可以用于显示
 * */
export let getHeaderMenus = function () {
  let headerMenuCurrent = getCurrentKey();
  let headerMenu = buildHeaderMenu(headerMenuData);
  return [headerMenu, headerMenuCurrent];
};
/*
 * 获取头部需要设为当前状态的菜单数据.
 * */
export let getCurrentHeaderMenu = function () {
  let headerMenuCurrent = getCurrentKey();
  for (let i = 0; i < headerMenuData.length; i++) {
    if (headerMenuCurrent == headerMenuData[i].key) {
      return headerMenuData[i];
    }
  }
  return null;
};
/*
 * 根据地址栏url 获取 头部菜单对应的key
 * */
function getCurrentKey() {
  let pathNames = location.hash.split('/');
  let headerMenuCurrent = null;
  if (pathNames && pathNames.length > 1) {
    headerMenuCurrent = pathNames[1].split('?')[0];
  }
  return headerMenuCurrent;
}

/*
 * 创建头部菜单jsx形式数据。
 * */
function buildHeaderMenu(menuData) {
  let menuItems = [];
  for (let i = 0; i < menuData.length; i++) {
    let md = menuData[i];
    if (md.children) {
      let mdChildren = md.children;
      let childrenContent = [];
      for (let j = 0; j < mdChildren.length; j++) {
        childrenContent.push(
          <Menu.Item key={mdChildren[j].key}>
            <Link to={mdChildren[j].path} style={{ color: '#666' }}>
              <FAIcon type={mdChildren[j].icon} />
              {mdChildren[j].text}
            </Link>
          </Menu.Item>
        );
      }
      menuItems.push(
        <SubMenu key={md.key} title={<span><Link style={{ color: '#666' }} to={md.path}><FAIcon type={md.icon} /> {md.text}</Link></span>}>
          {childrenContent}
        </SubMenu>
      );
    } else {
      menuItems.push(
        <Menu.Item key={md.key}>
          <Link to={md.path}>
            <FAIcon type={md.icon} /> <span className="admin-header-sys-menu-text">{md.text}</span>
          </Link>
        </Menu.Item>
      );
    }
  }
  return menuItems;
}