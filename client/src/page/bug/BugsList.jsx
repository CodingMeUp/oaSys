import './style.bug.less';
import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { browserHistory, Router, Route, Link } from 'react-router';
import { connect } from 'react-redux';
import moment from 'moment';
import FAIcon from '../../framework/faicon/FAIcon';
import { Breadcrumb, Button, Menu, Icon, Tree, Tooltip, Spin, message, Modal, Select, Dropdown, Table, Input, Form, DatePicker, Alert } from 'antd';
import Page from '../../framework/page/Page';
import Storage from '../../framework/common/storage';
import Funs from '../../framework/common/functions';
import * as BugAction from '../../actions/bugs';
import UiCtrl from '../utils/UiCtrl';
import BUG_LANG from './BugLang';
import _ from 'lodash';
import BugAssigned from './win/BugAssigned';
import BugActive from './win/BugActive';
import BugClosed from './win/BugClosed';
import PubSubMsg from '../../framework/common/pubsubmsg';

const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const TreeNode = Tree.TreeNode;
const ButtonGroup = Button.Group;
const DropdownButton = Dropdown.Button;
const Option = Select.Option;

let countI = 1;
const key_side_state = 'BUG_SIDE_BAR_SHOW_OR_HIDE';
const key_current_project = 'BUG_CURRENT_PROJECT';
const top_current_project = Funs.top_current_project + '_' + _USERINFO.userId;
class BugsList extends Component {
  constructor(props) {
    super(props);
    this.sideBarIsDisplay = Storage.local.get(key_side_state) ? Storage.local.get(key_side_state).state : undefined;
    //this.productId = Storage.local.get(key_current_project) ? Storage.local.get(key_current_project).pmsProject.id : (window._BUG_PRODUCT_ID ? parseInt(window._BUG_PRODUCT_ID) : undefined);
    this.productName = '';
    this.pageSize = 20;
    this.lastValueCtrlArr = {};
    this.isDoSearch = {};
    let type = Storage.local.get(top_current_project) ? Storage.local.get(top_current_project).type : null;
    this.productId = Storage.local.get(top_current_project) ? Storage.local.get(top_current_project).pmsProjectId : '';

  }

  getSearchOption() {
    const { location } = this.props;
    const browse = location.query.browseType ? location.query.browseType : 'unclosed';
    const moduleId = location.query.moduleId;
    const offset = +location.query.offset ? +location.query.offset : 1;
    const sortField = location.query.sortField;
    const sortOrder = location.query.sortOrder;
    this.browseType = browse;
    this.moduleId = moduleId;
    this.offset = offset;
    this.sortField = sortField;
    this.sortOrder = sortOrder;

    return {
      browseType: this.browseType,
      limit: this.pageSize,
      productId: this.productId,
      moduleId: this.moduleId,
      offset: this.offset,
      sortField: this.sortField,
      sortOrder: this.sortOrder,
      isShowModules: location.query.isShowModules ? '1' : ''
    };
  }

  componentDidMount() {
    const _this = this;
    const { bugAction, location } = this.props;
    let searchOption = this.getSearchOption();
    if (countI === 1 || location.query.refresh) {
      this.browseType = location.query.browseType ? location.query.browseType : 'unclosed';
      searchOption.isFirst = 1;
      searchOption.isShowModules = 1;

    }
    bugAction.getBugList(searchOption);
    countI++;
    PubSubMsg.subscribe('get_current_project', function (resData) {

      _this.productId = resData.returnData.pmsProjectId;
      if (_this.productId) {
        const { bugAction, location } = _this.props;
        let searchOption = _this.getSearchOption();
        _this.browseType = location.query.browseType ? location.query.browseType : 'unclosed';
        searchOption.isFirst = 1;
        searchOption.isShowModules = 1;
        bugAction.getBugList(searchOption);
        countI++;
      }

    });
  }
  componentWillUnmount() {
    PubSubMsg.unsubscribe('get_current_project');
  }
  componentDidUpdate(prevProps) {
    const tf = _.isEqual(this.props.location, prevProps.location);
    // console.log(_.isEqual(this.props.location, prevProps.location), this.props.location, prevProps);
    //add by dwq  如果productId有值才处理对应的bugAction
    if (this.productId) {
      if (!tf) {
        const { bugAction, location } = this.props;
        const searchOption = this.getSearchOption();
        bugAction.getBugList(searchOption);
        this.searchPanelDisplayVal = false;
        this.isDoSearch = {};
        bugAction.showOrHideSearchbar(false);
      }

      if (this.props.error) {
        message.error(this.props.error);
        bugAction.clearErrors();
        return false;
      }
    }
  }


  formatUrlSearch(offsetToOne = false, browseType = undefined, isShowModules = false) {
    let obj = {
      browseType: browseType ? browseType : this.browseType,
      productId: this.productId,
      moduleId: this.moduleId,
      offset: this.offset,
      sortField: this.sortField,
      sortOrder: this.sortOrder
    };
    if (offsetToOne) {
      delete obj.offset;
    }
    if (isShowModules) {
      obj.isShowModules = 1;
    }

    let url = '?';
    let urlArr = [];
    for (let o in obj) {
      if (obj[o]) {
        urlArr.push(o + '=' + obj[o]);
      }
    }
    url += urlArr.join('&');

    return url;
  }

  handleTableChange(pagination, filters, sorter) {
    this.offset = pagination.current;
    // console.log(sorter);
    if (!_.isEmpty(sorter)) {
      this.sortField = sorter.columnKey;
      this.sortOrder = sorter.order;
    } else {
      this.sortField = null;
      this.sortOrder = null;
    }
    if (!_.isEmpty(this.isDoSearch)) {
      const { bugAction } = this.props;
      bugAction.getBugList({
        searchGroup1Value: this.isDoSearch.searchGroup1Value,
        searchGroup2Value: this.isDoSearch.searchGroup2Value,
        searchCondition: this.isDoSearch.searchCondition,
        offset: this.offset,
        sortField: this.sortField,
        sortOrder: this.sortOrder,
        productId: this.productId
      });
    } else {
      this.context.router.push({ pathname: '/bug', search: this.formatUrlSearch() });
    }

    UiCtrl.scrollToTop();
  }

  moduleTreeSelect(info, e, node, event) {
    const nodeData = e.node.props.nodeData;
    this.moduleId = nodeData.id;

    this.context.router.push({ pathname: '/bug', search: this.formatUrlSearch() });

    UiCtrl.scrollToTop();
  }

  sideBarDisplayHide(state) {
    const { bugAction } = this.props;
    Storage.local.set(key_side_state, { 'state': state });
    this.sideBarIsDisplay = state;
    bugAction.showOrHideSidebar(state);
  }

  menuClick(e) {
    const data = e.item.props.data;
    if (data.pmsProject.constructor == Object && data.pmsProject.id) {
      const { bugAction } = this.props;
      Storage.local.set(key_current_project, { 'pmsProject': data.pmsProject });
      this.productId = data.pmsProject.id;
      this.moduleId = undefined;

      this.context.router.push({ pathname: '/bug', search: this.formatUrlSearch(true, undefined, true) });
    } else if (data.pmsProject.constructor == Array) {
      message.info('数据格式变换，请重新关联PMS项目。');
    } else {
      message.info('未关联PMS产品ID，无法显示该项目BUG');
    }
  }

  fieldSelectChange(i, groupIndex, e) {
    const params = BUG_LANG.searchParams[e];
    if (params) {
      this.searchParamValues = {
        i: i,
        groupIndex: groupIndex,
        values: params.values,
        control: params.control,
        operator: params.operator,
        field: e
      };
    }
  }

  showSearch() {
    const { bugAction } = this.props;
    const tf = this.searchPanelDisplayVal ? false : true;
    this.searchPanelDisplayVal = tf;
    bugAction.showOrHideSearchbar(tf);
  }

  doSearchBug() {
    const { bugAction } = this.props;
    let group1Value = [], group2Value = [],
      searchCondition = this.props.form.getFieldValue('searchCondition');


    for (let i = 0; i < BUG_LANG.searchGroupItems; i++) {
      let field = this.props.form.getFieldValue('field_1_' + i);
      let operator = this.props.form.getFieldValue('operator_1_' + i);
      let value = this.props.form.getFieldValue('value_1_' + i)
        ? this.props.form.getFieldValue('value_1_' + i)
        : this.props.form.getFieldValue('value_1_' + i + '_' + field);

      let condition = '';
      if (i > 0) {
        condition = this.props.form.getFieldValue('condition_1_' + i);
      }
      if (field && operator && value) {
        group1Value.push({
          field: field,
          operator: operator,
          value: value,
          condition: condition
        });
      }
    }

    for (let i = 0; i < BUG_LANG.searchGroupItems; i++) {
      let field = this.props.form.getFieldValue('field_2_' + i);
      let operator = this.props.form.getFieldValue('operator_2_' + i);
      let value = this.props.form.getFieldValue('value_2_' + i)
        ? this.props.form.getFieldValue('value_2_' + i)
        : this.props.form.getFieldValue('value_2_' + i + '_' + field);
      let condition;
      if (i > 0) {
        condition = this.props.form.getFieldValue('condition_2_' + i);
      }
      if (field && operator && value) {
        group2Value.push({
          field: field,
          operator: operator,
          value: value,
          condition: condition
        });
      }
    }


    // let sqlWhere1 = '', sqlWhere2 = '';
    // if (group1Value.length > 0) {
    //   group1Value.forEach(item => {
    //     if (item.condition) {
    //       sqlWhere1 += item.condition + " `" + item.field + "` " + item.operator  + " '" + item.value + "' \n";
    //     } else {
    //       sqlWhere1 += "`" + item.field + "` " + item.operator  + " '" + item.value + "' \n";
    //     }
    //   });
    // }
    // if (group2Value.length > 0) {
    //   group2Value.forEach(item => {
    //     if (item.condition) {
    //       sqlWhere2 += item.condition + " `" + item.field + "` " + item.operator  + " '" + item.value + "' \n";
    //     } else {
    //       sqlWhere2 += "`" + item.field + "` " + item.operator  + " '" + item.value + "' \n";
    //     }
    //   });
    // }
    // console.log(sqlWhere1, sqlWhere2, searchCondition);

    this.isDoSearch = {
      searchGroup1Value: JSON.stringify(group1Value),
      searchGroup2Value: JSON.stringify(group2Value),
      searchCondition: searchCondition
    };

    bugAction.getBugList({
      searchGroup1Value: JSON.stringify(group1Value),
      searchGroup2Value: JSON.stringify(group2Value),
      searchCondition: searchCondition,
      productId: this.productId
    });
  }
  openAssignedTo(bugId) {
    const { bugAction } = this.props;
    bugAction.getBugById(bugId, true);
    bugAction.doBugViewModalVisible('assignedToModal', true);
  }

  onAssignedToModalCancel() {
    const { bugAction } = this.props;
    bugAction.doBugViewModalVisible('assignedToModal', false);
  }

  onAssignedToModalOk() {
    const { bugAction, routeParams } = this.props;
    bugAction.doBugViewModalVisible('assignedToModal', false);
    bugAction.getBugList(this.getSearchOption());
  }
  openActive(bugId) {
    const { bugAction } = this.props;
    bugAction.getBugById(bugId, true);
    bugAction.doBugViewModalVisible('activeModal', true);
  }

  onActiveModalCancel() {
    const { bugAction } = this.props;
    bugAction.doBugViewModalVisible('activeModal', false);
  }

  onActiveModalOk() {
    const { bugAction, routeParams } = this.props;
    bugAction.doBugViewModalVisible('activeModal', false);
    bugAction.getBugList(this.getSearchOption());
  }

  openClosed(bugId) {
    const { bugAction } = this.props;
    bugAction.getBugById(bugId, true);
    bugAction.doBugViewModalVisible('closedModal', true);
  }

  onClosedModalCancel() {
    const { bugAction } = this.props;
    bugAction.doBugViewModalVisible('closedModal', false);
  }

  onClosedModalOk() {
    const { bugAction, routeParams } = this.props;
    bugAction.doBugViewModalVisible('closedModal', false);
    bugAction.getBugList(this.getSearchOption());
  }

  render() {
    const { bugAction, location } = this.props;
    const currentPagesize = +location.query.offset ? +location.query.offset : 1;
    // const currentPagesize = _.isEmpty(this.isDoSearch) ? (+location.query.offset ? +location.query.offset : 1) : (this.isDoSearch.offset ? this.isDoSearch.offset : 1);+location.query.offset ? +location.query.offset : 1;
    this.getSearchOption();
    const _this = this;
    const { getFieldProps, getFieldValue, getFieldError, isFieldValidating } = this.props.form;
    const projects = this.props.projects;

    // this.currentProjectName = _.isEmpty(projects) ? '' : projects[0].projectName;
    // this.productId = _.isEmpty(projects) ? 0 : projects[0].pmsProject.id;
    //edit by dwq
    // const menuItems = projects.map((item, i) => {
    //   let pmsProjectId = '';
    //   let pmsProjectName = '';
    //   if (item.pmsProject && item.pmsProject.constructor == Array) {   // 以后数据都正常去掉这块代码判断。
    //     pmsProjectId = item.pmsProject[0].id;
    //     pmsProjectName = item.projectName + '!!请重新关联该PMS项目';
    //   } else if (item.pmsProject && item.pmsProject.constructor == Object) {
    //     pmsProjectId = item.pmsProject.id;
    //     pmsProjectName = item.projectName;
    //   } else {

    //   }

    //   if (item.pmsProject && this.productId == pmsProjectId) {
    //     this.currentProjectName = pmsProjectName;
    //     return (<Menu.Item key={item._id} data={item}><a><strong>{item.projectName}</strong></a></Menu.Item>);
    //   } else if (pmsProjectId != '' && pmsProjectId != 0) {
    //     return (<Menu.Item key={item._id} data={item}><a>{item.projectName}</a></Menu.Item>);
    //   } else {
    //     return (<Menu.Item key={item._id} data={item} style={{ 'display': "none" }}><a></a></Menu.Item>);
    //   }
    // });
    // const menu = (
    //   <Menu onClick={this.menuClick.bind(this)}>
    //     {menuItems}
    //   </Menu>
    // );

    // let type = Storage.local.get(top_current_project) ? Storage.local.get(top_current_project).type : null;
    // let name;

    // if (type == 'product') {
    //   name = (
    //     <Dropdown overlay={menu} visible={false}>
    //       <span style={{ fontSize: 18, color: '#333' }}>
    //         （{Storage.local.get(top_current_project).currentProjectName}）<span style={{ fontSize: 12, display: 'none' }}><Icon type="down" /></span>
    //       </span>
    //     </Dropdown>
    //   );
    // } else {
    //   name = (
    //     <Dropdown overlay={menu}>
    //       <span style={{ fontSize: 18, color: '#333' }}>
    //         （{this.currentProjectName}）<span style={{ fontSize: 12 }}><Icon type="down" /></span>
    //       </span>
    //     </Dropdown>
    //   );
    // }
    //edit end
    const pageHeader =
      <div>
        <h1 className="admin-page-header-title">
          BUG管理
          {/*{name}*/}
        </h1>
        <Breadcrumb>
          <Breadcrumb.Item>
            <Icon type="home" />
            首页
          </Breadcrumb.Item>
          <Breadcrumb.Item>BUG管理</Breadcrumb.Item>
        </Breadcrumb>
      </div>;


    const columns = [{
      title: 'ID',
      dataIndex: 'id',
      width: 60,
      sorter: true,
      render: function (o, row, index) {
        return (
          <Link style={{color: '#1a53ff' }} to={`/bug/view/${row.id}`}>{o}</Link>
        );
      }
    }, {
      title: '级别',
      width: 60,
      sorter: true,
      dataIndex: 'severity',
      render: function (o, row, index) {
        let style = {};
        switch (o) {
          case 2:
            style = { color: '#888' };
            break;
          case 3:
            style = { color: '#666' };
            break;
          case 4:
            style = { color: '#333', backgroundColor: '#f09450', padding: 5 };
            break;
          case 5:
            style = { color: '#333', backgroundColor: 'red', padding: 5 };
            break;
          default:
            style = { color: '#999' };
            break;
        }
        return <span style={style}>{BUG_LANG.severityList[o]}</span>;
      }
    }, {
      title: 'P',
      width: 56,
      sorter: true,
      dataIndex: 'pri',
      render: function (o, row, index) {
        if (o != 2 && o != 0) {
          let style = {};
          switch (o) {
            case 1:
              style = { color: '#333', backgroundColor: 'gray', padding: 5 };
              break;
            case 3:
              style = { color: '#333', backgroundColor: 'yellow', padding: 5 };
              break;
            case 4:
              style = { color: '#333', backgroundColor: '#f09450', padding: 5 };
              break;
          }
          return <span style={style}>{BUG_LANG.priList[o]}</span>;
        }
      }
    }, {
      title: 'Bug标题',
      dataIndex: 'title',
      sorter: true,
      render: function (o, row, index) {
        const confired_style = row.confirmed == 1 ? { color: 'green' } : { color: '#666' };
        return (
          <span>
            <span style={confired_style}>[{BUG_LANG.confirmedList[row.confirmed]}]</span> <Link style={{color: '#1a53ff' }} to={`/bug/view/${row.id}`} title={o}>{o}</Link>
          </span>
        );
      }
    }, {
      title: '状态',
      width: 60,
      sorter: true,
      dataIndex: 'status',
      render: function (o, row, index) {
        let style = {};
        switch (o) {
          case 'closed':
            style = { color: '#999' };
            break;
          case 'resolved':
            style = { color: 'green' };
            break;
          case 'active':
            style = { color: '#8957a1' };
            break;
        }
        return <span style={style}>{BUG_LANG.statusList[o]}</span>;
      }
    }, {
      title: '创建',
      sorter: true,
      width: 60,
      key: 'openedBy',
      dataIndex: 'openedByRealname'
    }, {
      title: '创建日期',
      width: 90,
      sorter: true,
      dataIndex: 'openedDate',
      render: function (o, row, index) {
        return moment(o).format('MM-DD HH:mm');
      }
    }, {
      title: '解决版本',
      width: 80,
      dataIndex: 'resolvedBuildName',
      render: function (o, row, index) {
        return <div title={o} style={{ overflow: 'hidden', width: 70, whiteSpace: 'nowrap' }}>{o}</div>;
      }
    }, {
      title: '环境',
      width: 60,
      sorter: true,
      dataIndex: 'stage',
      render: function (o, row, index) {
        return BUG_LANG.stageList[o];
      }
    }, {
      title: '难易',
      width: 60,
      sorter: true,
      dataIndex: 'difficulty',
      render: function (o, row, index) {
        return BUG_LANG.difficultyList[o];
      }
    }, {
      title: '指派',
      width: 60,
      sorter: true,
      key: 'assignedTo',
      dataIndex: 'assignedToRealname',
      render: function (o, row, index) {
        if (row.assignedTo === 'tqnd' + window._USERINFO.userId) {
          return <span style={{ color: 'red' }}>{o}</span>
        } else {
          return o;
        }
      }
    }, {
      title: '解决',
      width: 60,
      sorter: true,
      key: 'resolvedBy',
      dataIndex: 'resolvedByRealname'
    }, {
      title: '方案',
      width: 80,
      sorter: true,
      dataIndex: 'resolution',
      render: function (o, row, index) {
        return <span>{BUG_LANG.resolutionList[o]}</span>;
      }
    }, {
      title: '解决日期',
      width: 90,
      sorter: true,
      dataIndex: 'resolvedDate',
      render: function (o, row, index) {
        if (o) {
          return moment(o).format('MM-DD HH:mm');
        }
      }
    }, {
      title: '操作',
      width: 150,
      render: function (o, row, index) {
        const confirmbugDisabled = row.status == 'active' && row.confirmed == 0;
        const resolveDisabled = row.status == 'active';
        const closeDisabled = row.status == 'resolved';
        let activeTag, closedTag;
        if (row.status == "resolved") {
          activeTag = <a title="激活" onClick={() => _this.openActive(row.id)}><FAIcon type="fa-certificate" /> </a>
          closedTag = <a title="关闭" onClick={() => _this.openClosed(row.id)}><FAIcon type="fa-power-off" /> </a>
        } else if (row.status == 'closed') {
          activeTag = <a title="激活" onClick={() => _this.openActive(row.id)}><FAIcon type="fa-certificate" /> </a>
        }
        return (
          <span className="operate-btn">
            {/** <a disabled={!confirmbugDisabled} title="确认"><FAIcon type="fa-search" /></a>
              <a title="指派"><FAIcon type="fa-hand-o-right" /></a>
              <a disabled={!resolveDisabled} title="解决"><FAIcon type="fa-check-square-o" /></a>
              <a disabled={!closeDisabled} title="关闭"><FAIcon type="fa-times-circle-o" /></a>
              */}
            {activeTag}
            {closedTag}
            <a title="指派" onClick={() => _this.openAssignedTo(row.id)}><FAIcon type="fa-hand-o-right" /></a>
            <Link to={`/bug/edit/${row.id}`} title="编辑"><FAIcon type="fa-edit" /></Link>
            <Link to={`/bug/create?productId=${_this.productId}&bugId=${row.id}`} title="复制"><FAIcon type="fa-clone" /></Link>
          </span>
        );
      }
    }];
    const rowSelection = {
      selectedRowKeys: this.props.selectedRowKeys,
      width: 40
    };
    const currentModuleId = this.moduleId ? this.moduleId : 0;
    const searchMenuArr = {
      '未关闭': ['unclosed', '/bug' + this.formatUrlSearch(true, 'unclosed')],
      '所有': ['all', '/bug' + this.formatUrlSearch(true, 'all')],
      '指派给我': ['assignToMe', '/bug' + this.formatUrlSearch(true, 'assignToMe')],
      '由我创建': ['openedByMe', '/bug' + this.formatUrlSearch(true, 'openedByMe')],
      '由我解决': ['resolvedByMe', '/bug' + this.formatUrlSearch(true, 'resolvedByMe')],
      '未确认': ['unconfirmed', '/bug' + this.formatUrlSearch(true, 'unconfirmed')],
      '未指派': ['assignToNull', '/bug' + this.formatUrlSearch(true, 'assignToNull')],
      '未解决': ['unResolved', '/bug' + this.formatUrlSearch(true, 'unResolved')],
      '久未处理': ['longLifeBugs', '/bug' + this.formatUrlSearch(true, 'longLifeBugs')],
      '被延期': ['postponedBugs', '/bug' + this.formatUrlSearch(true, 'postponedBugs')],
      // '需求变动': ['needconfirm', '/bug?browseType=needconfirm&productId=' + this.productId]
    };
    let searchOperatorsOptions = [];
    for (let p in BUG_LANG.searchOperators) {
      searchOperatorsOptions.push(<Option value={p} key={`op_${p}`}>{BUG_LANG.searchOperators[p]}</Option>);
    }
    let searchFieldsOptions = [];
    for (let p in BUG_LANG.searchFields) {
      searchFieldsOptions.push(<Option value={p} key={`filed_${p}`}>{BUG_LANG.searchFields[p]}</Option>);
    }

    let searchMenu = [];
    for (var m in searchMenuArr) {
      if (this.browseType === searchMenuArr[m][0] && !this.props.searchBarIsDisplay) {
        searchMenu.push(<li key={m}><a className="active">{m}</a></li>);
      } else {
        searchMenu.push(<li key={m}><Link to={searchMenuArr[m][1]}>{m}</Link></li>);
      }
    }
    let pagination = this.props.pagination;
    pagination.showSizeChanger = true;
    pagination.showQuickJumper = true;
    pagination.pageSizeOptions = ['10', '20', '30', '40', '50', '60', '70', '80', '90', '100'];
    pagination.defaultCurrent = currentPagesize;
    pagination.showTotal = function (total) {
      return `共 ${total} 条`;
    };
    pagination.onShowSizeChange = function (current, pageSize) {
      _this.pageSize = pageSize;
    };

    const loopTree = data => data.map((item) => {
      let title = <span>{item.name}</span>;
      if (item.id == this.moduleId) {
        title = <strong>{item.name}</strong>;
      }
      if (item.children && item.children.length > 0) {
        return (
          <TreeNode key={item.id} title={title} nodeData={item} isLeaf={true} expanded={true} >
            {loopTree(item.children)}
          </TreeNode>
        );
      } else {
        return <TreeNode key={item.id} title={title} nodeData={item} expanded={true} isLeaf={true} />;
      }
    });
    const dropdownButtonMenu = (
      <Menu>
        <Menu.Item key="1">确认</Menu.Item>
        <Menu.Item key="2">关闭</Menu.Item>
        <SubMenu key="s1" title="解决">
          <Menu.Item key="3">外部原因</Menu.Item>
          <Menu.Item key="4">延期处理</Menu.Item>
        </SubMenu>
      </Menu>
    );
    const sideBarIsDisplay = this.sideBarIsDisplay !== undefined ? this.sideBarIsDisplay : (this.props.sideBarIsDisplay === undefined ? true : this.props.sideBarIsDisplay);
    const sideBarDisplay = sideBarIsDisplay ? { width: 200, opacity: 100 } : { width: 0, opacity: 0 };
    const bugContainerStyle = sideBarIsDisplay ? { marginLeft: 205 } : { marginLeft: 0 };
    const bugContainerIconStyle = sideBarIsDisplay ? { display: 'none' } : { display: '' };

    const getModalZoneItem = (
      <div>
        <BugAssigned
          visible={this.props.modalVisable.assignedToModal}
          onOk={this.onAssignedToModalOk.bind(this)}
          onCancel={this.onAssignedToModalCancel.bind(this)}
          bugId={this.id}
          productId={this.product}
          projectId={this.project} />
        <BugActive
          visible={this.props.modalVisable.activeModal}
          onOk={this.onActiveModalOk.bind(this)}
          onCancel={this.onActiveModalCancel.bind(this)}
          bugId={this.id}
          productId={this.product}
          projectId={this.project} />
        <BugClosed
          visible={this.props.modalVisable.closedModal}
          onOk={this.onClosedModalOk.bind(this)}
          onCancel={this.onClosedModalCancel.bind(this)}
          bugId={this.id}
          productId={this.product}
          projectId={this.project} />
      </div>
    );

    const getSearchGroupItem = function (groupIndex) {
      let searchGroupItem = [];
      for (let i = 0; i < BUG_LANG.searchGroupItems; i++) {
        let firstSpan = (<span className="firstAndTxt">第{groupIndex === 2 ? '二' : '一'}组</span>);
        if (i > 0) {
          firstSpan = (<span className="txt">
            <Select {...getFieldProps(`condition_${groupIndex}_${i}`, { initialValue: 'and' }) }>
              <Option key="and" value="and">并且</Option>
              <Option key="or" value="or">或者</Option>
            </Select>
          </span>);
        }
        let lastValueCtrl = (<Input {...getFieldProps(`value_${groupIndex}_${i}`) } />);
        let operatorCtrlProps = getFieldProps(`operator_${groupIndex}_${i}`);
        let operatorCtrlValue;

        if (_this.searchParamValues && _this.searchParamValues.i === i && _this.searchParamValues.groupIndex === groupIndex) {
          if (_this.searchParamValues.control === 'select') {
            let selectOption = [];
            if (typeof _this.searchParamValues.values === 'object') {
              for (let p in _this.searchParamValues.values) {
                selectOption.push(<Option value={p} key={`soptelect_${p}`}>{_this.searchParamValues.values[p]}</Option>);
              }
            }
            lastValueCtrl = (<Select {...getFieldProps(`value_${groupIndex}_${i}_${_this.searchParamValues.field}`) } style={{ width: 162 }}>{selectOption}</Select>);
          } else if (_this.searchParamValues.control === 'datetime') {
            lastValueCtrl = (<DatePicker {...getFieldProps(`value_${groupIndex}_${i}_${_this.searchParamValues.field}`) } style={{ width: 162 }} />);
          }

          operatorCtrlValue = _this.searchParamValues.operator;
        } else {
          if (_this.lastValueCtrlArr[groupIndex + '_' + i]) {
            lastValueCtrl = _this.lastValueCtrlArr[groupIndex + '_' + i];
          }
        }

        _this.lastValueCtrlArr[groupIndex + '_' + i] = lastValueCtrl;
        // console.log(lastValueCtrl);

        if (operatorCtrlValue) {
          operatorCtrlProps = getFieldProps(`operator_${groupIndex}_${i}`, { initialValue: operatorCtrlValue });
        }
        let content = (<div className="group_1" key={'group_' + groupIndex + '_' + i}>
          {firstSpan}
          <span>
            <Select style={{ width: 130 }} onSelect={_this.fieldSelectChange.bind(_this, i, groupIndex)} {...getFieldProps(`field_${groupIndex}_${i}`) }>
              {searchFieldsOptions}
            </Select>
          </span>
          <span>
            <Select style={{ width: 90 }} {...operatorCtrlProps}>
              {searchOperatorsOptions}
            </Select>
          </span>
          <span>{lastValueCtrl ? lastValueCtrl : (<Input {...getFieldProps(`value_${groupIndex}_${i}`) } />)}</span>
        </div>);
        searchGroupItem.push(content);
      }
      return searchGroupItem;
    }

    const searchPanelDisplay = this.props.searchBarIsDisplay ? { display: 'block' } : { display: 'none' };
    const searchLinkClass = this.props.searchBarIsDisplay ? 'active' : '';
    const isNotPmsDisplay = this.productId ? { display: '' } : { display: 'none' };
    const isPmsDisplay = this.productId ? { display: 'none' } : { display: '' };
    //add by dwq
    let currentName = Storage.local.get(top_current_project) ? Storage.local.get(top_current_project).currentProjectName : "";
    let currentNames = "当前项目没有关联PMS项目,无法使用BUG管理功能，请先关联PMS项目，若有疑问请联系测试负责人或导航12580工作人员。";
    if (currentName) {
      currentNames = "当前项目【" + currentName + "】没有关联PMS项目,无法使用BUG管理功能，请先关联PMS项目，若有疑问请联系测试负责人或导航12580工作人员。"
    };
    //add end

    return (
      <Page header={pageHeader} unShowPageAnimate={true}>
        <div className="alertMessage" style={isPmsDisplay}>
          <Alert
            message="友情提示 "
            description={currentNames}
            type="info"
            showIcon
            />
        </div>
        <div className="bug-header" style={isNotPmsDisplay}>
          <ul className="floatRight">
            {/*
            <li>
              <a><Icon type="cloud-download-o" /> 导出</a>
            </li>
            <li>
              <a><Icon type="area-chart" /> 报表</a>
            </li>
            <li>
              <a><Icon type="plus-circle" /> 批量添加</a>
            </li>
            */}
            <li>
              <Link to={`/bug/create?productId=${this.productId}`}><Icon type="plus-circle-o" /> 提BUG</Link>
            </li>
          </ul>

          <ul className="floatLeft">
            {searchMenu}
            <li>
              <a className={searchLinkClass} onClick={() => this.showSearch()}>
                <Icon type="search" /> 搜索
              </a>
            </li>
          </ul>
          <div className="modalZone" style={{ display: 'none' }}>{getModalZoneItem}</div>
          <div className="searchPanel" style={searchPanelDisplay}>
            <Spin spinning={this.props.searchBarSpinning}>
              <table>
                <tbody>
                  <tr>
                    <td width="35%">
                      <div className="searchPanelGroup">
                        {getSearchGroupItem(1)}
                      </div>
                    </td>
                    <td width="10%">
                      <Select {...getFieldProps('searchCondition', { initialValue: 'and' }) } style={{ paddingRight: 5 }}>
                        <Option key="and" value="and">并且</Option>
                        <Option key="or" value="or">或者</Option>
                      </Select>
                    </td>
                    <td style={{ textAlign: 'left' }} width="35%">
                      <div className="searchPanelGroup" style={{ float: 'left' }}>
                        {getSearchGroupItem(2)}
                      </div>
                    </td>
                    <td style={{ textAlign: 'left' }} width="10%">
                      <Button onClick={() => this.doSearchBug()}>查询</Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Spin>
          </div>
        </div>

        <div className="bug-content" style={isNotPmsDisplay}>
          <div className="bug-side" style={sideBarDisplay}>
            <h2>
              <a className="icon" onClick={this.sideBarDisplayHide.bind(this, false)} style={{ float: "right" }}>
                <FAIcon type="fa-angle-left" />
              </a>
              <div  style={{ wordBreak: "keep-all", whiteSpace: "nowrap", display: "block", overflow: "hidden" }}>
                <Link to={`/bug?browseType=unclosed&productId=${this.productId}`} title = {currentName}>{currentName}</Link>
              </div>
            </h2>
            <div>
              <Tree showLine
                onSelect={this.moduleTreeSelect.bind(this)}
                >
                {loopTree(this.props.modules)}
              </Tree>
            </div>
          </div>
          <div className="bug-container" style={bugContainerStyle}>
            <a className="hideIcon" onClick={this.sideBarDisplayHide.bind(this, true)} style={bugContainerIconStyle}><FAIcon type="fa-angle-right" /></a>
            <Table
              rowKey={record => record.id}

              columns={columns}
              loading={this.props.tableLoading}
              dataSource={this.props.bugs}
              pagination={pagination}
              onChange={this.handleTableChange.bind(this)}
              />
            {/**
            <div className="bug-footer">
              <ButtonGroup>
                <Button>全选</Button>
                <Button>反选</Button>
              </ButtonGroup>
              <span className="padd">
                <DropdownButton trigger={['click']} overlay={dropdownButtonMenu}>
                  批量编辑
                </DropdownButton>
              </span>
            </div>
             */}
          </div>
        </div>
      </Page>
    );
  }
}

BugsList.contextTypes = {
  router: React.PropTypes.object.isRequired
};

BugsList = Form.create()(BugsList);

export default connect((state, props) => ({
  tableLoading: state.buglist.tableLoading,
  bugs: state.buglist.bugs,
  modules: state.buglist.modules,
  projects: state.buglist.projects,
  pagination: state.buglist.pagination,
  sideBarIsDisplay: state.buglist.sideBarIsDisplay,
  searchBarIsDisplay: state.buglist.searchBarIsDisplay,
  error: state.buglist.error,
  searchBarSpinning: state.buglist.searchBarSpinning,

  modalVisable: state.bugview.modalVisable,
  users: state.buglist.users,
  actions: state.buglist.actions,
  productList: state.buglist.productList,
  projectList: state.buglist.projectList,
  builds: state.buglist.builds,
}), dispatch => ({
  bugAction: bindActionCreators(BugAction, dispatch)
}))(BugsList);