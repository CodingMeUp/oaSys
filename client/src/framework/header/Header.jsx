import './style.less';
import React from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router';
import { Timeline, Affix, Badge, TreeSelect, Tooltip, Menu, Popconfirm, Popover, Button, Icon, message, Tag, Alert, Modal} from 'antd';
import moment from 'moment';
import Ajax from '../../framework/common/ajax';
import Routes from '../../framework/Routes';
import API from '../../page/API';
import FAIcon from '../faicon/FAIcon';
import PubSubMsg from '../common/pubsubmsg';
import Storage from '../common/storage';
import Function from '../common/functions';
import reqwest from 'reqwest';
import { getSidebarMenus, getCurrentSidebarMenu } from '../SidebarMenu';
import Settings from '../settings/Settings';
import CryptoJS from 'crypto-js';
import $ from 'jquery';
const TreeNode = TreeSelect.TreeNode;
var logoMaxWidth = 180
  , logoMinWidth = 50
  , logoMax = "用例管理平台"
  , logoMin = "QA"
  ;

const top_current_project = Function.top_current_project + '_' + _USERINFO.userId;
const top_project_hash = 'hash_' + _USERINFO.userId;
const Header = React.createClass({
  getInitialState() {
    return {
      menu: [],
      current: '',
      treeData: [],
      visible: false,
      versionVisible: false,
      helpVisible: false,
      inputText: '',
      collapseSidebar: Settings.collapseSidebar(),
      isRemindBadgeShow: false,
      userAvatar: '',
      data: [],
      isClose: false,
      modalVisible: false,
      //解密
      value: Storage.local.get(top_current_project) ? Function.decrypt(Storage.local.get(top_current_project).currentProject, Function.secret) : ''
    };
  },
  onClick() {

  },
  onSelect(value, e, a) {

    //e a 只能取到key value isLeaf antd的固定格式字段等 type取不到 去user_role_pro里再去找一遍 
    let _this = this;
    reqwest({
      url: '/selectProject',
      method: 'post',
      contentType: 'application/json',
      data: JSON.stringify({ 'value': value, 'user_id': _USERINFO.userId }),
      type: 'json',
      success: (returnData) => {
        var result = returnData.sessionInfo;
        var auth = [];

        if (result.userRoles) {
          result.userRoles.forEach(function (item) {
            if (item !== null) {
              auth.push({
                oper_href: item.oper_href
              })
            }
          });
        }
        if (result.userRoles && result.userRoles.length > 0) {
          _USERINFO.auth = auth;
          // console.log(value);
          // console.log(returnData);
          this.setState({
            value: value
          });
          Storage.local.set(top_current_project, {
            'currentProject': Function.encrypt(value, Function.secret),
            'type': returnData.type,
            'currentProjectName': (returnData.type == 'project' && returnData.type != 'product') ? returnData.projectInfo.projectName
              : returnData.productInfo.productName,
            'auth': auth,
            'pmsProjectId': returnData.pmsProjectId,
            'u': _USERINFO.userId
          });
          let treeSelectDom = ReactDOM.findDOMNode(_this.refs.topProSelect);
          $(treeSelectDom).find('.ant-select-selection__rendered').text(Storage.local.get(top_current_project).currentProjectName);
          PubSubMsg.publish('get_current_project', {
            returnData
          });
          PubSubMsg.publish('update_todo_tree', {});//为了刷新待执行树
          if (auth) {
            let hash = Storage.local.get(top_project_hash);

            let pathname = hash ? hash.split(window.location.origin + '/client#')[1] : '/case/'; // 可能存在一进来没有hash的数据
            let isAuth = false;
            auth.forEach(item => {
              if ((pathname.indexOf("/bug/view/") > -1) || (pathname.indexOf("/bug/edit/") > -1)) {
                if ((item.oper_href.indexOf("/bug/view/") > -1) || (item.oper_href.indexOf("/bug/edit/") > -1)) {
                  isAuth = true;
                }
              } else if (item.oper_href === '/client' + pathname) {
                isAuth = true;
              }
            });

            if (!isAuth) {
              location.replace(window.location.origin + '/client#/401?');
            } else {
              if (hash) {
                if (_this.hasZtProductId == false) {
                  location.replace(hash);
                }

              } else {
                location.replace(window.location.origin + '/client#/case?');
              }
            }
          }

          // PubSubMsg.publish('renderRouter',{
          //   returnData
          // });

          // ReactDOM.render(<Routes />, document.getElementById('framework'));
          //暂定强制刷新 记录上次路由

          // if(location.hash.indexOf('#/401?') >=  0){
          //   // window.
          // }else{
          //   Storage.local.set(top_project_hash,location.href); 
          // }
          // location.reload();
          // location.replace(Storage.local.get(top_project_hash));
        } else {
          this.setState({ modal1Visible:true });

        }
      }
    });
  },
  onSearch(value) {

  },
  hide() {
    this.setState({
      visible: false,
    });
  },
  versionHide() {
    reqwest({
      url: API.SYSTEM_VERSIONLOOK,
      method: 'post',
      contentType: 'application/json',
      data: JSON.stringify({ user: _USERINFO.userId }),
      type: 'json',
      success: (result) => {
        this.setState({
          versionVisible: false,
          isClose: result.isClose
        });
      }
    });
  },
  adviceSubmit() {
    if (this.state.inputText.replace(/^\s*/, '') == '') {
      message.info("意见不能为空，请输入内容", 3)
      return
    }
    reqwest({
      url: '/client/advice',
      method: 'post',
      contentType: 'application/json',
      data: JSON.stringify({ content: this.state.inputText, user: _USERINFO }),
      type: 'json',
      success: (result) => {
        this.hide();
      }
    });
  },
  handleVisibleChange(visible) {
    this.setState({ visible });
  },
  versionHandleVisibleChange(versionVisible) {
    this.setState({ versionVisible });
  },
  helpHandleVisibleChange(helpVisible) {
    this.setState({ helpVisible });
  },
  handleChange(event) {
    this.setState({ inputText: event.target.value });
  },
  handleSwitchMenu(e) {
    Settings.collapseSidebar(!Settings.collapseSidebar());
    let menu = getSidebarMenus();
    let currentSidebarMenu = getCurrentSidebarMenu();
    let current = currentSidebarMenu ? currentSidebarMenu.key : '';

    PubSubMsg.publish('switch-sidebar', Settings.collapseSidebar());
    PubSubMsg.publish('sidebar-menu', {
      menu,
      current
    });
    this.setState({
      collapseSidebar: Settings.collapseSidebar()
    });
  },
  handleExit(e) {
    window.location.href = '/client/logout';
  },
  componentDidMount() {
    let _this = this;
    PubSubMsg.subscribeAcceptOldMsg('header-menu', function (data) {
      _this.setState({
        menu: data.menu,
        current: data.current
      });

    });
    //订阅消息，添加时刷新导航项目
    PubSubMsg.subscribe('project-add-update', function (data) {
      _this.loadTreeSelect();
    });
    //订阅消息，删除时刷新导航项目
    PubSubMsg.subscribe('project-del-update', function (data) {
      _this.loadTreeSelect();
      if (_this.state.treeData[0]) {
        _this.onSelect(_this.state.treeData[0].value);
      } else {
        message.error("当前用户没有任何项目");
      }
    });
    this.hasZtProductId = false;
    PubSubMsg.subscribe('get_product', function (data) {

      if (data && data.ztProductId) {
        _this.hasZtProductId = true;
        _this.onSelect(data.ztProductId);

      }

    });
    this.loadVersionData();
    this.loadTreeSelect();
    this.setState({
      userAvatar: 'http://cs.101.com/v0.1/static/cscommon/avatar/' + _USERINFO.userId + '/' + _USERINFO.userId + '.jpg?size=480'
    });
    //add by  dwq for  message添加全局配置
    message.config({
      top: 80,
      duration: 3,
    });
  },
  componentWillReceiveProps(nextProps) {
    // console.log(nextProps);
    // this.setState({
    //   likesIncreasing: nextProps.likeCount > this.props.likeCount
    // });
  },
  componentDidUpdate() {
    // console.log(this.findDOMNode(this.refs.topProSelect));
  },
  componentWillUnmount() {
    PubSubMsg.unsubscribe('project-add-update');
    PubSubMsg.unsubscribe('project-del-update');
    PubSubMsg.subscribe('get_product');
  },
  setModalVisible(modal1Visible) {
    this.setState({ modal1Visible });
  },
  loadTreeSelect: function () {
    let _this = this;
    let data = Storage.local.get(top_current_project) ? {
      '_id': Function.decrypt(Storage.local.get(top_current_project).currentProject, Function.secret),
      'type': Storage.local.get(top_current_project).type
    } : {};
    $.ajax({
      url: API.PRODUCT_PROJECT_TREESELECT,
      type: 'post',
      async: false,
      data: data,
      success: function (result) {
        _this.setState({
          treeData: result.treeData,
        });
        if (Storage.local.get(top_current_project) && (Storage.local.get(top_current_project).u == _USERINFO.userId)) {
          Storage.local.set(top_current_project, {
            'currentProject': Storage.local.get(top_current_project).currentProject,
            'type': Storage.local.get(top_current_project).type,
            'currentProjectName': Storage.local.get(top_current_project).currentProjectName,
            'auth': result.auth,
            'pmsProjectId': Storage.local.get(top_current_project).pmsProjectId,
            'u': result.userid
          });
          _USERINFO.auth = result.auth;

        } else {
          Storage.local.set(top_current_project, {
            'currentProject': Function.encrypt(result.defaultProject, Function.secret),
            'type': result.defaultType,
            'currentProjectName': result.defaultProjectName,
            'pmsProjectId': result.pmsProjectId,
            'auth': result.auth,
            'u': result.userid
          });
          _USERINFO.auth = result.auth;
          let treeSelectDom = ReactDOM.findDOMNode(_this.refs.topProSelect);

          let flag = false;
          flag = $(treeSelectDom).find('.ant-select-selection__rendered').text() ==
            Function.decrypt(Storage.local.get(top_current_project).currentProject, Function.secret) ? true : false;
          if (flag) {

          } else {
            $(treeSelectDom).find('.ant-select-selection__rendered').text(Storage.local.get(top_current_project).currentProjectName);
            // $(treeSelectDom).find('a[title="' + Storage.local.get(top_current_project).currentProjectName + '"]').addClass('ant-select-tree-node-selected');
          }

        }

      },
    });

  },
  loadVersionData: function () {
    let _this = this;
    _this.initReq = Ajax.get({
      url: API.SYSTEM_VERSION,
      data: {
        lookedUser: _USERINFO.userId
      },
      before() {
        _this.setState({
          loading: true
        });
      },
      success(res) {
        const result = res.body;
        if (result.status === 200) {
          _this.setState({
            data: result.data,
            isClose: result.isClose,
            loading: false
          });
        }
      }
    })
  },
  downloadHelp() {
    window.location.href = '/用例平台用户手册.docx';
  },
  render() {
    let currentLink = window.location.href;
    let versionButton;
    let _this = this;
    const content = (
      <div>
        <textarea className="advice" onChange={this.handleChange} placeholder="谢谢您写下宝贵的意见!"></textarea>
        <br />
        <Button type='primary' className="adviceSubmit" onClick={this.adviceSubmit}>提交</Button>
        <Button type='ghost' className="adviceCancel" onClick={this.hide}>关闭</Button>
      </div>
    );
    const versionContent = (
      <div>
        <div>
          <strong>更新日志：</strong>
        </div>
        <div className="versionContent">
          <br></br>
          <Timeline>
            {this.state.data.map(da =>
              <Timeline.Item key={da._id} color="green">
                <div style={{ fontSize: 14 }}>
                  <p>
                    <strong>版本：<Tag color="blue">{da.ver}</Tag>  更新时间：{moment(da.date).format('YYYY-MM-DD')}</strong>
                  </p>
                  <div dangerouslySetInnerHTML={{ __html: da.remark.replace(/\n/g, "<br />") }} />
                </div>
              </Timeline.Item>
            )}
          </Timeline>
        </div>
        <Button type='primary' className="versionCancel" onClick={this.versionHide}>关闭</Button>
      </div>
    );
    //http://km.ndea.99.com/ui/load91u.aspx?uid=100013 另外一种调用消息窗口的方法
    const helpContent = (
      <div className='cls12580'>
        <a href="im://msg/?uin=139851&amp;type=0"><FAIcon type="fa-male" /> 139851（<span>邓文强</span>）</a>
        <a href="im://msg/?uin=100013&amp;type=0"><FAIcon type="fa-male" /> 100013（<span>陈雨浓</span>）</a>
        <a href="im://msg/?uin=331035&amp;type=0"><FAIcon type="fa-female" /> 331035（<span>龚玉婷</span>）</a>
        <a href="im://msg/?uin=308352&amp;type=0"><FAIcon type="fa-female" /> 308352（<span>何丽晶</span>）</a>
      </div>
    );

    if (this.state.isClose) {
      versionButton = (
        <li className="admin-header-menu-item">
          <Tooltip placement="bottomRight" title="更新日志">
            <Popover content={versionContent} trigger="click"
              visible={this.state.versionVisible} onVisibleChange={this.versionHandleVisibleChange}>
              <a href="javascript:;">
                <FAIcon type="fa-list-ul" />
              </a>
            </Popover>
          </Tooltip>
        </li>
      )
    } else {
      versionButton = (
        <li className="admin-header-menu-item">
          <Badge dot style={{ marginLeft: -10, marginTop: 10 }}>
            <Tooltip placement="bottomRight" title="更新日志">
              <Popover content={versionContent} trigger="click"
                visible={this.state.versionVisible} onVisibleChange={this.versionHandleVisibleChange}>
                <a href="javascript:;">
                  <FAIcon type="fa-list-ul" />
                </a>
              </Popover>
            </Tooltip>
          </Badge>
        </li>
      )
    }
    return (
      <header className="admin-header" >
        <span className="group-logo"><img width='40' height='45' src={'/assets/ArmyAntsLOGO_256.png'} alt="{_USERINFO.userName}" /></span>
        <span className="platform-logo" style={{ logoMaxWidth }}>
          <Link to="/">{logoMax}</Link></span>
        {/*<Tooltip placement="bottom" title="切换菜单状态">
          <a className="admin-sidebar-toggle" onClick={this.handleSwitchMenu}><FAIcon type="fa-bars" /></a>
        </Tooltip>*/}
        <TreeSelect ref="topProSelect"
          style={{ width: 160, marginTop: -32, marginRight: 10 }}
          showSearch={true}
          onSearch={this.onSearch}
          onClick={this.onClick}
          dropdownMatchSelectWidth={false}
          dropdownStyle={{ minHeight: 300, width: 250, maxHeight: 500, overflow: 'auto' }}
          treeNodeFilterProp={'label'}
          value={this.state.value}
          placeholder="当前选择的产品项目"
          treeData={this.state.treeData}
          treeDefaultExpandAll
          onSelect={this.onSelect}
          >
        </TreeSelect>


        <Menu className="admin-header-sys"
          selectedKeys={[this.state.current]}
          mode="horizontal">
          {this.state.menu}
        </Menu>
        <ul className="admin-header-menu">
          <li className="admin-header-menu-item">
            <Tooltip placement="bottomRight" title="">
              <Popover content={helpContent} trigger="click" title="如有问题请联系我们~"
                visible={this.state.helpVisible} onVisibleChange={this.helpHandleVisibleChange}>
                <a href="javascript:;">
                  12580
                </a>
              </Popover>
            </Tooltip>
          </li>

          {versionButton}

          <li className="admin-header-menu-item">
            <Tooltip placement="bottomRight" title="意见反馈">
              <Popover content={content} trigger="click"
                visible={this.state.visible} onVisibleChange={this.handleVisibleChange}>
                <a href="javascript:;">
                  <FAIcon type="fa-envelope-o" />
                </a>

              </Popover>
            </Tooltip>
          </li>
          <li className="admin-header-menu-item">
            <Tooltip placement="bottomRight" title="帮助手册">
              <a href="/assets/book/用例平台用户手册.docx" download>
                <Icon type="question-circle-o" />
              </a>

            </Tooltip>
          </li>
          <li className="admin-header-menu-item">
            &nbsp;
            <img src={this.state.userAvatar} className="admin-user-avatar" alt="{_USERINFO.userName}" />
            {_USERINFO.userName}
            &nbsp;
          </li>
          <li className="admin-header-menu-item">
            <Popconfirm title="您确定要退出系统吗？" onConfirm={this.handleExit}>
              <a href="javascript:;">
                <FAIcon type="fa-sign-out" /> 退出
              </a>
            </Popconfirm>
          </li>
        </ul>
        <div>
         <Modal
          title="亲，该本产品在用例平台无访问权限哦！"
          style={{ top: 50 }}
          visible={this.state.modal1Visible}
          onOk={() => this.setModalVisible(false)}
          onCancel={() => this.setModalVisible(false)}
        >
        
           <p style={{color:"red"}}>请确认该产品是否为您进行相关配置哦！！！</p>
           <p style={{color:"red"}}>如有疑问，请在系统右上角12580联系我们的工作人员！</p>
     
        </Modal>
        </div>
      </header>

    );
  }
});

export default Header;
