import './style.bug.less';
import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { browserHistory, Router, Route, Link } from 'react-router';
import { connect } from 'react-redux';
import moment from 'moment';
import FAIcon from '../../framework/faicon/FAIcon';
import { Breadcrumb, Button, Menu, Icon, Tree, Tooltip, Spin, message, Modal, Select, Dropdown, Table, Tabs } from 'antd';
import Page from '../../framework/page/Page';
import * as BugAction from '../../actions/bugs';
import UiCtrl from '../utils/UiCtrl';
import BUG_LANG from './BugLang';
import BugUtils from './BugUtils';
import classNames from 'classnames';
import _ from 'lodash';
import $ from 'jquery';
import BugComment from './win/BugComment';
import BugAssigned from './win/BugAssigned';
import BugActive from './win/BugActive';
import BugClosed from './win/BugClosed';
import BugConfirm from './win/BugConfirm';

const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const TreeNode = Tree.TreeNode;
const TabPane = Tabs.TabPane;


class BugView extends Component {
  constructor(props) {
    super(props);

  }

  componentDidMount() {
    const { bugAction, location, routeParams } = this.props;
    const bugId = routeParams.id;
    if (+bugId) {
      bugAction.getBugById(bugId,true);
    }

    $('body').on('click', 'img', function (event) {
      window.open($(this).attr('src'));
    });

    BugUtils.addHistoryJQueryOperationt();
  }

  componentWillUnmount() {
    document.title = '用例管理';
    $('body').unbind("click");
  }

  componentDidUpdate(prevProps) {
    // var tf = _.isEqual(this.props.location, prevProps.location);
    // // console.log(_.isEqual(this.props.location, prevProps.location), this.props.location, prevProps.location);

    // if (!tf) {
   	//   const { bugAction, location } = this.props;
    //   var searchOption = this.getSearchOption();
    //   bugAction.getBugList(searchOption);
    // }
  }

  openActive(bugId) {
    const { bugAction } = this.props;
    bugAction.doBugViewModalVisible('activeModal', true);
  }

  onActiveModalCancel() {
    const { bugAction } = this.props;
    bugAction.doBugViewModalVisible('activeModal', false);
  }

  onActiveModalOk() {
    const { bugAction, routeParams } = this.props;

    bugAction.doBugViewModalVisible('activeModal', false);
    bugAction.getBugById(routeParams.id);
  }

  openClosed(bugId) {
    const { bugAction } = this.props;
    bugAction.doBugViewModalVisible('closedModal', true);
  }

  onClosedModalCancel() {
    const { bugAction } = this.props;
    bugAction.doBugViewModalVisible('closedModal', false);
  }

  onClosedModalOk() {
    const { bugAction, routeParams } = this.props;

    bugAction.doBugViewModalVisible('closedModal', false);
    bugAction.getBugById(routeParams.id);
  }

  openAssignedTo(bugId) {
    const { bugAction } = this.props;
    bugAction.doBugViewModalVisible('assignedToModal', true);
  }

  onAssignedToModalCancel() {
    const { bugAction } = this.props;
    bugAction.doBugViewModalVisible('assignedToModal', false);
  }

  onAssignedToModalOk() {
    const { bugAction, routeParams } = this.props;

    bugAction.doBugViewModalVisible('assignedToModal', false);
    bugAction.getBugById(routeParams.id);
  }

  openComment(bugId) {
    const { bugAction } = this.props;
    bugAction.doBugViewModalVisible('commentModal', true);
  }

  onCommentModalCancel() {
    const { bugAction } = this.props;
    bugAction.doBugViewModalVisible('commentModal', false);
  }

  onCommentModalOk() {
    const { bugAction, routeParams } = this.props;

    bugAction.doBugViewModalVisible('commentModal', false);
    bugAction.getBugById(routeParams.id);
  }

  openConfirm(bugId) {
    const { bugAction } = this.props;
    bugAction.doBugViewModalVisible('confirmModal', true);
  }

  onConfirmModalCancel() {
    const { bugAction } = this.props;
    bugAction.doBugViewModalVisible('confirmModal', false);
  }

  onConfirmModalOk(comment) {
    const { bugAction } = this.props;
    bugAction.doBugViewModalVisible('confirmModal', false);
  }

  goBack(productId) {
    const { location } = this.props;
    if (location.query.from === 'edit') {
      this.context.router.push({ pathname: '/bug', search: '?productId=' + productId });
    } else {
      this.context.router.goBack();
    }
  }

  render() {
    const { bugAction, bug } = this.props;
    const _this = this;
    const pageHeader =
      <div>
        <h1 className="admin-page-header-title">
          BUG浏览
        </h1>
        <Breadcrumb>
          <Breadcrumb.Item>
            <Icon type="home" />
            首页
          </Breadcrumb.Item>
          <Breadcrumb.Item>BUG管理</Breadcrumb.Item>
          <Breadcrumb.Item>BUG浏览</Breadcrumb.Item>
        </Breadcrumb>
      </div>;
    let bugModuleData = [];
    if (!_.isEmpty(bug)) {
      document.title = 'BUG #' + bug.id + ' ' + bug.title;
      bug.moduleData.forEach((item, i) => {
        if (i !== bug.moduleData.length - 1) {
          bugModuleData.push(<span key={item.id}>{item.name} <FAIcon type='fa-angle-right' /> </span>);
        } else {
          bugModuleData.push(<span key={item.id}>{item.name}</span>);
        }
      });
    }
    const bugFiles = this.props.files.map(d =>{
      let link = "data/upload/1" + d.pathname;
      let name = d.title+"."+d.extension;
      return(
      <li key={d.id}>
        <FAIcon type="fa-file-archive-o" />
        <a href={link} download={name}>{d.title}.{d.extension}</a>
      </li>
      )
    });
    const actionHistorys = BugUtils.actionHistorys(this.props.actions);
    const historyIcon = classNames({
      'icon': true,
      'openOrClose': true
    });
    let activeTag,closedTag;
    if(bug.status == "resolved"){
        activeTag = <li><a title="激活" onClick={this.openActive.bind(this, bug.id)}><FAIcon type="fa-certificate" /> 激活</a></li>
        closedTag = <li><a title="关闭" onClick={this.openClosed.bind(this, bug.id)}><FAIcon type="fa-power-off" /> 关闭</a></li>
    }else if(bug.status =='closed'){
        activeTag = <li><a title="激活" onClick={this.openActive.bind(this, bug.id)}><FAIcon type="fa-certificate" /> 激活</a></li>
    }
    return (
      <Page header={pageHeader} loading={this.props.pageLoading} unShowPageAnimate={true}>
        <div className="bug-view-header">
          <ul className="floatRight">
          {/**
            <li><a title="确认" onClick={this.openConfirm.bind(this, bug.id)}><FAIcon type="fa-search" /> 确认</a></li>
            <li><a title="指派"><FAIcon type="fa-hand-o-right" /> 指派</a></li>
            <li><a title="解决"><FAIcon type="fa-check-circle-o" /> 解决</a></li>
            <li><a title="建用例"><FAIcon type="fa-sitemap" /> 建用例</a></li>
            */}
            {activeTag}
            {closedTag}
            <li><a title="指派" onClick={this.openAssignedTo.bind(this, bug.id)}><FAIcon type="fa-hand-o-right" /> 指派</a></li>
            <li><Link to={`/bug/edit/${bug.id}`} title="编辑"><FAIcon type="fa-edit" />编辑</Link></li>
            <li><a title="备注" onClick={this.openComment.bind(this, bug.id)}><FAIcon type="fa-comment-o" /> 备注</a></li>
            <li><Link to={`/bug/create?productId=${bug.product}&bugId=${bug.id}`} title="复制"><FAIcon type="fa-clone" /> 复制</Link></li>
            <li><a title="返回" onClick={this.goBack.bind(this, bug.product)}><FAIcon type="fa-mail-reply" /> 返回</a></li>
          </ul>
          <h2><span className="bugId">{bug.id}</span> {bug.title}</h2>
        </div>

        <div className="bug-view-content">
          <div className="bug-view-right">
            <div className="tab">
              <Tabs size="small">
                <TabPane tab="基本信息" key="tab_1">
                  <div className="tabContent">
                    <table>
                      <tbody>
                        <tr>
                          <td width="70" style={{minWidth: 70}}>所属产品</td>
                          <td>{bug.productName}</td>
                        </tr>
                        <tr>
                          <td>所属模块</td>
                          <td>
                            {bugModuleData}
                          </td>
                        </tr>
                        <tr>
                          <td>所属计划</td>
                          <td>{bug.planName}</td>
                        </tr>
                        <tr>
                          <td>Bug类型</td>
                          <td>{BUG_LANG.typeList[bug.type]}</td>
                        </tr>
                        <tr>
                          <td>严重程度</td>
                          <td><strong>{BUG_LANG.severityList[bug.severity]}</strong></td>
                        </tr>
                        <tr>
                          <td>难易程度</td>
                          <td><strong>{BUG_LANG.difficultyList[bug.difficulty]}</strong></td>
                        </tr>
                        <tr>
                          <td>优先级</td>
                          <td><strong>{BUG_LANG.priList[bug.pri]}</strong></td>
                        </tr>
                        <tr>
                          <td>是否漏测</td>
                          <td><strong>{BUG_LANG.lostTestList[bug.lostTest]}</strong></td>
                        </tr>
                        <tr>
                          <td>发现阶段</td>
                          <td><strong>{BUG_LANG.discoveryPhaseList[bug.discoveryPhase]}</strong></td>
                        </tr>
                        <tr>
                          <td>Bug状态</td>
                          <td>
                            {
                              bug.status === 'resolved' ?
                                <strong style={{ color: 'green' }}>{BUG_LANG.statusList[bug.status]}</strong>
                                : bug.status === 'active' ?
                                <strong style={{ color: '#DA70D6' }}>{BUG_LANG.statusList[bug.status]}</strong>
                                :
                                <strong style={{ color: '#778899' }}>{BUG_LANG.statusList[bug.status]}</strong>
                            }
                          </td>
                        </tr>
                        <tr>
                          <td>激活次数</td>
                          <td>{bug.activatedCount}</td>
                        </tr>
                        <tr>
                          <td>是否确认</td>
                          <td>{BUG_LANG.confirmedList[bug.confirmed]}</td>
                        </tr>
                        <tr>
                          <td>当前指派</td>
                          <td>
                            {
                              bug.assignedTo ?
                                <span>{bug.assignedToRealname?bug.assignedToRealname:bug.openedByRealname+'(bug创建者)'} 于 {moment(bug.assignedDate).format('YYYY-MM-DD HH:mm') }</span>
                                : ''
                            }
                          </td>
                        </tr>
                        <tr>
                          <td>操作系统</td>
                          <td>{BUG_LANG.osList[bug.os]}</td>
                        </tr>
                        <tr>
                          <td>环境</td>
                          <td>{BUG_LANG.stageList[bug.stage]}</td>
                        </tr>
                        <tr>
                          <td>平台</td>
                          <td>{BUG_LANG.platformList[bug.platform]}</td>
                        </tr>
                        <tr>
                          <td>浏览器</td>
                          <td>{BUG_LANG.browserList[bug.browser]}</td>
                        </tr>
                        <tr>
                          <td>关键词</td>
                          <td>{bug.keywords}</td>
                        </tr>
                        <tr>
                          <td>抄送给</td>
                          <td>{bug.mailtoRealname}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </TabPane>
                <TabPane tab="项目/需求/任务" key="tab_2">
                  <div className="tabContent">
                    <table>
                      <tbody>
                        <tr>
                          <td width="70">版本</td>
                          <td>{bug.projectName}</td>
                        </tr>
                        <tr>
                          <td>相关需求</td>
                          <td></td>
                        </tr>
                        <tr>
                          <td>相关任务</td>
                          <td>{bug.taskName}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </TabPane>
              </Tabs>
            </div>

            <div className="tab">
              <Tabs size="small">
                <TabPane tab="BUG的一生" key="tab_3">
                  <div className="tabContent">
                    <table>
                      <tbody>
                        <tr>
                          <td width="70">由谁创建</td>
                          <td>
                            {bug.openedByRealname} 于 {moment(bug.openedDate).format('YYYY-MM-DD HH:mm') }
                          </td>
                        </tr>
                        <tr>
                          <td>轮数</td>
                          <td>{bug.openedBuildName}</td>
                        </tr>
                        <tr>
                          <td>Bug责任人</td>
                          <td>
                            {
                              bug.duty1 ?
                                <span>{bug.duty1Realname}</span>
                                : ''
                            }
                          </td>
                        </tr>
                        <tr>
                          <td>预计解决</td>
                          <td>{bug.estimateDate}</td>
                        </tr>
                        <tr>
                          <td>由谁解决</td>
                          <td>
                            {
                              bug.resolvedBy ?
                                <span>{bug.resolvedByRealname} 于 {moment(bug.resolvedDate).format('YYYY-MM-DD HH:mm') }</span>
                                : ''
                            }
                          </td>
                        </tr>
                        <tr>
                          <td>解决版本</td>
                          <td>
                          {bug.resolvedBuildName}
                          </td>
                        </tr>
                        <tr>
                          <td>解决方案</td>
                          <td>
                            {BUG_LANG.resolutionList[bug.resolution]}
                          </td>
                        </tr>
                        <tr>
                          <td>由谁关闭</td>
                          <td>
                            {
                              bug.closedBy ?
                                <span>{bug.closedByRealname} 于 {moment(bug.closedDate).format('YYYY-MM-DD HH:mm') }</span>
                                : ''
                            }
                          </td>
                        </tr>
                        <tr>
                          <td>最后修改</td>
                          <td>
                            {
                              bug.lastEditedBy ?
                                <span>{bug.lastEditedByRealname} 于 {moment(bug.lastEditedDate).format('YYYY-MM-DD HH:mm') }</span>
                                : ''
                            }
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </TabPane>
                <TabPane tab="其他相关" key="tab_4">
                  <div className="tabContent">
                    <table>
                      <tbody>
                        <tr>
                          <td width="70">来源用例</td>
                          <td>{`#${bug.case}`}</td>
                        </tr>
                        <tr>
                          <td>生成用例</td>
                          <td></td>
                        </tr>
                        <tr>
                          <td>关联产品</td>
                          <td>
                              {bug.linkedProduct}
                          </td>
                        </tr>
                        <tr>
                          <td>相关Bug</td>
                          <td><a href={`http://pms.sdp.nd/index.php?m=bug&f=view&bugID=${bug.linkBug}`}>{`#${bug.linkBug}`}</a></td>
                        </tr>
                        <tr>
                          <td>相关用例</td>
                          <td>{`#${bug.case}`}</td>
                        </tr>
                        <tr>
                          <td>转需求</td>
                          <td></td>
                        </tr>
                        <tr>
                          <td>转任务</td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </TabPane>
              </Tabs>
            </div>
          </div>

          <div className="bug-view-left">
            <fieldset>
              <legend>重现步骤</legend>
              <div className="steps_content" dangerouslySetInnerHTML={{ __html: bug.steps }}></div>
            </fieldset>

            <fieldset>
              <legend>附件</legend>
              <div>
                <ul className="bug-view-files">
                  {bugFiles}
                </ul>
              </div>
            </fieldset>

            <fieldset>
              <legend>
                历史记录
                <span className="icon"><FAIcon type="fa-arrow-down" /></span>
                <span className={historyIcon}><FAIcon type="fa-plus" /></span>
              </legend>
              <div>
                <ol className='historyItem'>
                  {actionHistorys}
                </ol>
              </div>
            </fieldset>
          </div>

        </div>

        <BugAssigned
          visible={this.props.modalVisable.assignedToModal}
          onOk={this.onAssignedToModalOk.bind(this)}
          onCancel={this.onAssignedToModalCancel.bind(this)}
          bugId={bug.id}
          productId={bug.product}
          projectId={bug.project}
          />
        <BugActive
          visible={this.props.modalVisable.activeModal}
          onOk={this.onActiveModalOk.bind(this)}
          onCancel={this.onActiveModalCancel.bind(this)}
          bugId={bug.id}
          productId={bug.product}
          projectId={bug.project}
          />
        <BugClosed
          visible={this.props.modalVisable.closedModal}
          onOk={this.onClosedModalOk.bind(this)}
          onCancel={this.onClosedModalCancel.bind(this)}
          bugId={bug.id}
          productId={bug.product}
          projectId={bug.project}
          />

        <BugComment
          visible={this.props.modalVisable.commentModal}
          onOk={this.onCommentModalOk.bind(this)}
          onCancel={this.onCommentModalCancel.bind(this)}
          bugId={bug.id}
          productId={bug.product}
          projectId={bug.project}
          />

        <BugConfirm visible={this.props.modalVisable.confirmModal} onOk={this.onConfirmModalOk.bind(this)} onCancel={this.onConfirmModalCancel.bind(this)} />
      </Page>
    );

  }

}

BugView.contextTypes = {
  router: React.PropTypes.object.isRequired
};

export default connect((state, props) => ({
  bug: state.bugview.bug,
  files: state.bugview.files,
  actions: state.bugview.actions,
  pageLoading: state.bugview.pageLoading,
  modalVisable: state.bugview.modalVisable,

  users: state.bugview.users,
  productList: state.bugview.productList,
  projectList: state.bugview.projectList,
  taskList: state.bugview.taskList,
  builds: state.bugview.builds,
  modules: state.bugview.modules,
  storys: state.bugview.storys,
  updateBugInfo: state.bugview.updateBugInfo,
  error: state.bugview.error
}), dispatch => ({
  bugAction: bindActionCreators(BugAction, dispatch)
}))(BugView);