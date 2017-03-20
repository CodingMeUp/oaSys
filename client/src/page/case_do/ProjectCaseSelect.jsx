import './style.less';
import React from 'react';
import { Table, message, Modal, Input, InputNumber, Checkbox, Form, Button, Icon, Tooltip, Tag, Menu, Dropdown, notification, Select } from 'antd'
import API from '../API';
import Storage from '../../framework/common/storage';
import Ajax from '../../framework/common/ajax';
import UserSelect from './UserSelect';
import CaseDoResult from './CaseDoResult';
import CaseDoEdit from './CaseDoEdit';
import PubSubMsg from '../../framework/common/pubsubmsg';

const CheckboxGroup = Checkbox.Group;
const FormItem = Form.Item;
const confirm = Modal.confirm;
const Option = Select.Option;

/**
 * 设置用例执行任务
 */
const ProjectCaseSelect = React.createClass({
  stateValue: {
    saveData: []
  },
  getInitialState() {
    return {
      data: [],
      userData: [],
      tableLoading: true,
      defaultExpandedRowKeys: [],
      selectedRowKeys: [],
      versionSelectOption: [],
      modalVisible: false,
      saveModalVisible: false,
      confirmLoading: false,
      saveEditModalVisible: false,
      confirmSaveEditLoading: false,
      modalTitle: '设置用例执行人员',
      projectNameFilters: [],
      pagination: {
        pageSize: 5
      },
      userSelectVal: {

      }
    }
  },
  fetch(showSaveSuccessMsg = false) {
    if (this.tableLoading) {
      return;
    }
    let _this = this;
    Ajax.get({
      url: API.MODULE_TREE_WITH_CASE_DO_INFO,
      success(res) {
        const result = res.body;
        let defaultExpandedRowKeys = [];
        let projectNameFilters = [];
        let projectNameFiltersLabel = [];
        result.data.forEach(item => {
          defaultExpandedRowKeys.push(item._id);
          var filters = {
            text: item.label.split(' ')[0],
            value: item.label.split(' ')[0]
          };
          if (projectNameFiltersLabel.indexOf(item.label) < 0) {
            projectNameFilters.push(filters);
            projectNameFiltersLabel.push(item.label);
          }
        });

        let state = {
          tableLoading: false,
          data: result.data,
          defaultExpandedRowKeys: defaultExpandedRowKeys,
          selectedRowKeys: [],
          projectNameFilters: projectNameFilters
        };

        if (showSaveSuccessMsg) {
          state.confirmSaveEditLoading = false;
          state.saveEditModalVisible = false;

          _this.setState(state);
          message.success('已保存成功');
        } else {
          _this.setState(state);
        }
      }
    })
  },
  componentWillUnmount() {
    PubSubMsg.unsubscribe('caes-do-edit-save-success');
  },
  componentDidMount() {
    const _this = this;
    PubSubMsg.subscribe('caes-do-edit-save-success', function (data) {
      _this.fetch(true);
    });

    this.fetch();
  },
  // shouldComponentUpdate(nextProps, nextState) {
  //   return this.state.saveModalVisible !== nextState.saveModalVisible || nextProps.data !== this.props.data;
  // },
  onSelectChange(selectedRowKeys) {
    this.setState({ selectedRowKeys });
  },
  doCaseSetting() {
    this.setState({
      modalVisible: true,
      rowId: this.state.selectedRowKeys,
      modalTitle: '批量设置用例执行'
    })
  },
  setCaseDoUser(row) {
    this.stateValue.currentrow = row;
    this.setState({
      modalVisible: true,
      rowId: row._id,
      modalTitle: '设置用例执行 - ' + row.label,
      versionSelectOption: row.version ? row.version.split(',') : []
    })
  },
  handleOk() {
    if (this.state.rowId instanceof Array) {
      const _this = this;
      const loop = function (data, id) {
        data.forEach(function (item) {
          if (!item.children && item._id === id) {
            if (_this.stateValue.userSelectVal) {
              item.userValue = _this.stateValue.userSelectVal.value;
              item.userLabel = _this.stateValue.userSelectVal.label;
            }
            item.doVersion = _this.state.versionInputValue;
            item.doTimes = _this.stateValue.doTimes;
            item.doLevel = _this.stateValue.doLevel ? _this.stateValue.doLevel.join(',') : ['高', '中', '低'].join(',');
          }
          if (item.children) {
            loop(item.children, id);
          }
        });
      }
      this.state.rowId.forEach(id => {
        loop(this.state.data, id);
      })
    } else {
      if (this.stateValue.userSelectVal) {
        this.stateValue.currentrow.userValue = this.stateValue.userSelectVal.value;
        this.stateValue.currentrow.userLabel = this.stateValue.userSelectVal.label;
      }
      this.stateValue.currentrow.doVersion = this.state.versionInputValue;
      this.stateValue.currentrow.doTimes = this.stateValue.doTimes;
      this.stateValue.currentrow.doLevel = this.stateValue.doLevel ? this.stateValue.doLevel.join(',') : ['高', '中', '低'].join(',');
    }

    this.setState({
      modalVisible: false
    });
  },
  handleCancel(e) {
    this.setState({
      modalVisible: false
    });
  },
  userSelectChange(val, label) {
    const key = 'userSelect';
    const localUserSelect = Storage.local.get(key);
    let users = localUserSelect ? localUserSelect : [];
    let isHave = false;
    users.forEach(item => {
      if (item._id == val) {
        isHave = true;
      }
    })

    if (!isHave) {
      const nick_name = label.split('(')[0];
      users.push({ _id: val, nick_name: nick_name });
      if (users.length > 10) {
        Storage.local.set(key, users.slice(0, 10));
      } else {
        Storage.local.set(key, users);
      }
    }

    this.stateValue.userSelectVal = {
      value: val,
      label: label
    };
  },
  caseDoVersionChange(e) {
    this.stateValue.doVersion = e.target.value;
    this.setState({
      versionInputValue: e.target.value
    })
  },
  caseDoTimesChange(e) {
    this.stateValue.doTimes = e;
  },
  caseDoLevelChanage(e) {
    this.stateValue.doLevel = e;
  },
  doTimesChange(row, e) {
    row.doTimes = e;
  },
  doVersionChange(row, e) {
    row.doVersion = e.target.value;
  },
  doLevelChange(row, e) {
    row.doLevel = e;
  },
  renderUserSelect: function (o, row, index) {
    // console.log("~~~~");
    if (row.children) {

    } else {
      if (row.userLabel && row.userValue) {
        return (
          <Tooltip title="重新设置用例执行选项">
            <a style={{ color: 'green' }} onClick={this.setCaseDoUser.bind(this, row) }>{row.userLabel}</a>
          </Tooltip>
        );
      } else {
        return (
          <Tooltip title="设置用例执行选项">
            <a onClick={this.setCaseDoUser.bind(this, row) }>设置用例执行选项</a>
          </Tooltip>
        );
      }
    }
  },
  renderDoVersion: function (o, row, index) {
    if (row.children) {

    } else {
      return (
        // <Input defaultValue={o} onChange={this.doVersionChange.bind(this, row) } />
        <span>{o}</span>
      );
    }
  },
  renderDoTimes: function (o, row, index) {
    if (row.children) {

    } else {
      return (
        // <InputNumber min={1} max={10} defaultValue={o} onChange={this.doTimesChange.bind(this, row) } />
        <span>{o}</span>
      );
    }
  },
  renderLevel: function (o, row, index) {
    if (row.children) {

    } else {
      let val = o ? o : ['高', '中', '低'];
      return (
        // <CheckboxGroup options={['高', '中', '低']} defaultValue={val} onChange={this.doLevelChange.bind(this, row) } />
        <span>{o}</span>
      );
    }
  },
  /**
   * 打开查看用例的执行结果
   */
  openCaseDoResult(row, e) {
    if (e.key === 'menu-view') {
      Modal.info({
        title: '用例执行结果',
        width: '80%',
        content: (
          <CaseDoResult moduleId={row.moduleId} doCaseId={this.stateValue.selectCaseInfoId} />
        ),
        onOk() { },
      });
    } else if (e.key === 'menu-cancel') {
      const _this = this;
      confirm({
        title: '您是否确认要取消这项用例执行任务',
        content: '',
        onOk() {
          Ajax.post({
            url: API.CASE_DO_CANCEL,
            data: {
              _id: _this.stateValue.selectCaseInfoId
            },
            success(res) {
              message.success('已成功取消');
              _this.fetch();
            }
          })
        },
        onCancel() { }
      });
    } else if (e.key === 'menu-edit') {
      //如果当前用户 等于 创建用户 可以编辑

      this.setState({
        saveEditModalVisible: true
      });
    }
  },
  onMouseEnterDoCase(id) {
    this.stateValue.selectCaseInfoId = id;
  },
  /**
   * 渲染 用例执行状态 列 
   */
  renderCaseInfo: function (o, row, index) {
    if (row.children) {

    } else {
      if (o && o.length > 0) {
        return (
          <ul className="case-do-status-ul">
            {
              o.map((item, index) => {
                if (item.isCancel) {
                  return (
                    <li key={item._id}>
                      <del>
                        版本：{item.version}，
                          轮数：{item.times}，
                          执行人：{item.username}
                          <br/>
                          状态：<strong style={{color: 'gray'}}>已取消</strong>，
                          进度：{(item.doNumber / item.caseNumber * 100).toFixed(1)} %
                        </del> 
                    </li>
                  )
                } else {
                  const menu1 = (
                    <Menu onClick={this.openCaseDoResult.bind(this, row) }>
                      <Menu.Item key="menu-edit">
                        <Icon type="edit" /> 编辑
                      </Menu.Item>
                      <Menu.Item key="menu-cancel">
                        <Icon type="minus-circle-o" /> 取消
                      </Menu.Item>
                      <Menu.Divider />
                      <Menu.Item key="menu-view">
                        <Icon type="eye-o" /> 查看
                      </Menu.Item>
                    </Menu>
                  );
                  const menu2 = (
                    <Menu onClick={this.openCaseDoResult.bind(this, row) }>
                      <Menu.Item key="menu-view">
                        <Icon type="eye-o" /> 查看
                      </Menu.Item>
                    </Menu>
                  );
                  
                  return (
                    <li key={item._id} onMouseEnter={this.onMouseEnterDoCase.bind(this, item._id) }>
                      <Dropdown overlay={item.isComplete ? menu2 : menu1}>
                        <a>
                          版本：{item.version}，
                          轮数：{item.times}，
                          执行人：{item.username}
                          <br/>
                          状态：{item.isComplete ? (<strong style={{color: 'green'}}>已完成</strong>) : (<strong style={{color: 'red'}}>执行中</strong>)}，
                          进度：<Tag color="blue">{(item.doNumber / item.caseNumber * 100).toFixed(1)} %</Tag>
                        </a>                  
                      </Dropdown>
                    </li>
                  )
                }
              })
            }
          </ul>
        );
      }
    }
  },
  /**
   * 确认保存 分配任务
   */
  handleSaveDoCase() {
    const _this = this;
    _this.stateValue.saveData = [];

    const loop = function (data) {
      data.forEach(function (item) {
        if (item.userValue && item.userLabel && item.doTimes && item.doVersion && item.doLevel) {
          _this.stateValue.saveData.push(item);
        }
        if (item.children) {
          loop(item.children);
        }
      });
    }
    const loop1 = function (data) {
      loop(data);
      return (
        <ol className="do-check-ol">
          {
            _this.stateValue.saveData.map((item, index) => (
              <li key={item.key}>
              {item.label} -  
              <Tag color="blue">{item.userLabel}</Tag>   
              版本：<Tag color="blue">{item.doVersion}</Tag>   
              轮数：<Tag color="blue">{item.doTimes}</Tag>  
              <Tag color="yellow">{item.doLevel}</Tag>
              </li>
            ))
          }
        </ol>
      )
    }

    const content = loop1(this.state.data);
    if (this.stateValue.saveData.length === 0) {
      return false;
    }
    this.setState({
      modalContent: content,
      saveModalVisible: true
    })
  },
  /**
   * 提交 保存所有分配任务
   */
  handleSaveOk() {
    this.setState({
      confirmLoading: true
    })

    const _this = this;
    Ajax.post({
      url: API.CASE_DO_SAVE_ALLOCATION,
      data: { data: _this.stateValue.saveData },
      success(res) {
        if (res.statusCode === 200) {
          const body = res.body;
          
          if (body.status === 200) {
            _this.setState({
              saveModalVisible: false,
              confirmLoading: false
            });
            
            if (body.data.length > 0) {
              let description = body.data.map((item, index) => {
                if (item.type === 'case_null') {
                  return <p>{index + 1}. 模块：{item.moduleName}，版本：{item.version}，轮数：{item.times}，还没有可执行的用例</p>
                } else {
                  return <p>{index + 1}. 模块：{item.moduleName}，版本：{item.version}，轮数：{item.times}</p>
                }
              });
              notification['warn']({
                message: '因为存在相同的版本和轮数或该模块下没有可执行的模块，以下为被忽略的分配任务信息',
                description: description,
                duration: 0
              });
            }

            message.success('已保存成功');
            _this.fetch();
          }
        }
      }
    })


  },
  handleSaveCancel() {
    this.setState({
      saveModalVisible: false
    })
  },
  onTableExpend() {

  },
  render() {
    const columns = [{
      title: '项目名称',
      dataIndex: 'label',
      filters: this.state.projectNameFilters,
      onFilter: (value, record) => record.label.indexOf(value) === 0,
      sorter: (a, b) => a.label.localeCompare(b.label)
    }, {
        title: '设置用例执行选项',
        dataIndex: 'userLabel',
        render: this.renderUserSelect
      }, {
        title: '执行版本',
        width: 200,
        dataIndex: 'doVersion',
        render: this.renderDoVersion
      }, {
        title: '执行轮数',
        width: 100,
        dataIndex: 'doTimes',
        render: this.renderDoTimes
      }, {
        title: '用例级别筛选',
        dataIndex: 'doLevel',
        render: this.renderLevel
      }, {
        title: '用例执行状态',
        dataIndex: 'caseDoInfo',
        render: this.renderCaseInfo
      }];
    const { tableLoading, selectedRowKeys } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange
    };
    const hasSelected = selectedRowKeys.length > 0;
    const versionSelectOption = this.state.versionSelectOption.map(d => <Option key={d} value={d}>{d}</Option>);
    
    return (
      <div>
        <div className="case-do-btn-save">
          <Button type="primary" onClick={this.handleSaveDoCase}><Icon type="save" /> 保存所有分配任务</Button>

          <Button style={{ marginLeft: 10 }} type="ghost" onClick={this.doCaseSetting}
            disabled={!hasSelected}>批量设置</Button>
        </div>

        <div className="case-do-select">
          <Table bordered columns={columns}
            rowSelection={rowSelection}
            rowKey={record => record._id}
            loading={tableLoading}
            dataSource={this.state.data}
            pagination={this.state.pagination}
            onExpand={this.onTableExpend}
            defaultExpandedRowKeys={this.state.defaultExpandedRowKeys}
            />
        </div>

        <Modal maskClosable={false} title={this.state.modalTitle} visible={this.state.modalVisible}
          onOk={this.handleOk} onCancel={this.handleCancel}>
          <Form horizontal>
            <FormItem
              label="执行用户：">
              <UserSelect onChange={this.userSelectChange} />
            </FormItem>
          </Form>
          <Form horizontal>
            <FormItem
              label="执行版本：">
              <Input style={{ width: 160 }} value={this.state.versionInputValue} onChange={this.caseDoVersionChange} />
              <Select placeholder="选择版本" value={undefined} style={{ width: 120, paddingLeft: 5 }} onChange={(e) => {
                this.setState({versionInputValue: e})
              }}>
                {versionSelectOption}
              </Select>
            </FormItem>
          </Form>
          <Form horizontal>
            <FormItem
              label="执行轮数：">
              <InputNumber min={1} max={10} onChange={this.caseDoTimesChange} />
            </FormItem>
          </Form>
          <Form horizontal>
            <FormItem
              label="用例等级：">
              <CheckboxGroup options={['高', '中', '低']} defaultValue={['高', '中', '低']} onChange={this.caseDoLevelChanage} />
            </FormItem>
          </Form>
        </Modal>

        <Modal width={800} confirmLoading={this.state.confirmLoading} maskClosable={false} title="确认保存" visible={this.state.saveModalVisible}
          onOk={this.handleSaveOk} onCancel={this.handleSaveCancel}>
          {this.state.modalContent}
        </Modal>

        <CaseDoEdit saveEditModalVisible={this.state.saveEditModalVisible} doCaseId={this.stateValue.selectCaseInfoId} />

      </div>
    );
  },
});

export default ProjectCaseSelect;