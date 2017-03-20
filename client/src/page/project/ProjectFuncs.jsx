import './style.less';
import React from 'react';
import ReactDOM from 'react-dom';
import reqwest from 'reqwest';
import _ from 'lodash';
import { Breadcrumb, Transfer, Popconfirm, Row, Col, Table, Select, message, Modal, Input, InputNumber, Checkbox, Form, Button, Icon, Tooltip, Tag, Menu, Switch, Dropdown,TreeSelect } from 'antd'
import Page from '../../framework/page/Page';
import API from '../API';
import Storage from '../../framework/common/storage';
import PubSubMsg from '../../framework/common/pubsubmsg';
import Ajax from '../../framework/common/ajax';
import Function from '../../framework/common/functions';
import SearchInput from '../ctrl/SearchInput';
import CryptoJS from 'crypto-js';
import $ from 'jquery';
const Option = Select.Option;
const OptGroup = Select.OptGroup;
const CheckboxGroup = Checkbox.Group;
const FormItem = Form.Item;
const createForm = Form.create;
const confirm = Modal.confirm;
const InputGroup = Input.Group;


const top_current_project = Function.top_current_project + '_' + _USERINFO.userId;
let ProjectFuncs = React.createClass({
    stateValue: {},
    getInitialState() {
        return {
            data: [],
            treeData: [],
            value: Storage.local.get(top_current_project) ? Function.decrypt(Storage.local.get(top_current_project).currentProject, Function.secret) : '',
            projectId:'',
            modeDisabled: true,
            informDisabled: true,
            expiredDisabled: true,
            displayDisabled: true
        }
    },
    componentDidMount() {
        this.fetch();
        this.loadTreeSelect();
        // let _this = this;        
        // PubSubMsg.subscribe('get_current_project', function (resData) {
        //     _this.fetch();
        // });
        

    },
    fetch(params = {}) {
        const _this = this;
        var topProjectId =  Storage.local.get(top_current_project) ? Function.decrypt(Storage.local.get(top_current_project).currentProject, Function.secret) : null;
        reqwest({
            url: API.PROJECT_CONFIG,
            method: 'get',
            data: {
                'projectId': _this.state.projectId ? _this.state.projectId:topProjectId,
                'keyword': params ? params.keyword : ''
            },
            type: 'json',
            success: (result) => {
                if (result.status == 200) {
                    var isModeDisabled;
                    if (result.data[0].AuditMode == 2) {
                        isModeDisabled = false;
                    } else {
                        isModeDisabled = true;
                    }
                    _this.setState({
                        modeDisabled: isModeDisabled,
                        informDisabled: result.data[0].isInform ? false : true,
                        expiredDisabled: result.data[0].isExpired ? false : true,
                        displayDisabled: result.data[0].isDisplay ? false : true

                    });
                } else {
                    _this.setState({
                        modeDisabled: true,
                        informDisabled: true,
                        expiredDisabled: true,
                        displayDisabled: true

                    });

                }

            }

        });
    },
    modeSwitchChange(checked) {
        this.setState({
            modeDisabled: !checked
        })
    },
    informSwitchChange(checked) {
        this.setState({
            informDisabled: !checked
        })
    },
    expiredSwitchChange(checked) {
        this.setState({
            expiredDisabled: !checked
        })
    },
    displaySwitchChange(checked) {
        this.setState({
            displayDisabled: !checked
        })
    },
    saveConfigure() {
        let _this = this;
        var topProjectId =  Storage.local.get(top_current_project) ? Function.decrypt(Storage.local.get(top_current_project).currentProject, Function.secret) : null;
        reqwest({
            url: API.PROJECT_CONFIG_ADD,
            method: 'post',
            data: {
                'projectId':  _this.state.projectId ? _this.state.projectId:topProjectId,
                'AuditMode': this.state.modeDisabled ? 1 : 2,
                'isInform': this.state.informDisabled ? false : true,
                'isExpired': this.state.expiredDisabled ? false : true,
                'isDisplay': this.state.displayDisabled ? false : true
            },
            type: 'json',
            success: (result) => {
                if (result.status == 200) {
                    message.success('保存成功');
                } else {
                    message.success('保存失败');
                }

            }
        });
    },
   onSelect(value) {
        let _this = this;
        reqwest({
        url: '/selectProject',
        method: 'post',
        contentType: 'application/json',
        data: JSON.stringify({ 'projectValue': value, 'user_id': _USERINFO.userId }),
        type: 'json',
        success: (returnData) => {
            
            this.setState({
                value: value,
                projectId:returnData.projectInfo._id
            });
            _this.fetch();
            
        }
        });
    },
    
    onSearch(value) {

     },
     loadTreeSelect: function () {
        let _this = this;
        
        $.ajax({
            url:  API.PRODUCT_PROJECT_TREESELECT,
            type: 'post',
            async: false,
            // data: data,
            success: function (result) {
                _this.setState({
                treeData: result.treeData,
                });

            },
        });
    },
    render() {
        const pageHeader =
            <div>
                <h1 className="admin-page-header-title">项目功能权限设置

                </h1>
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <Icon type="home" />
                        首页
          </Breadcrumb.Item>
                    <Breadcrumb.Item>项目管理</Breadcrumb.Item>
                    <Breadcrumb.Item>功能权限设置</Breadcrumb.Item>
                </Breadcrumb>
            </div>;
        return (
            <Page header={pageHeader} loading={this.state.loading}>
                <Form horizontal className="ant-advanced-search-form">
                     <TreeSelect ref="topProSelect"
                        style={{ width: 160,  marginRight: 10 }}
                        showSearch={true}
                        onSearch={this.onSearch}
                        dropdownMatchSelectWidth={false}
                        dropdownStyle={{ minHeight: 300, width: 250, maxHeight: 800, overflow: 'auto' }}
                        treeNodeFilterProp={'label'}
                        value={this.state.value}
                        placeholder="当前选择的产品项目"
                        treeData={this.state.treeData}
                        treeDefaultExpandAll
                        onSelect={this.onSelect}
                        >
                    </TreeSelect>
                    <Row gutter={16} style={{ marginTop: 20 }}>
                        <Col sm={8}>
                            <FormItem label="审核模式是否可编辑" labelCol={{ span: 20 }} wrapperCol={{ span: 4 }}>
                                <Switch onChange={this.modeSwitchChange} checkedChildren={'是'} unCheckedChildren={'否'} checked={!this.state.modeDisabled} />
                            </FormItem>
                            <FormItem label="是否抄送通知：" labelCol={{ span: 20 }} wrapperCol={{ span: 4 }}>
                                <Switch onChange={this.informSwitchChange} checkedChildren={'是'} unCheckedChildren={'否'} checked={!this.state.informDisabled} />
                            </FormItem>
                        </Col>
                        <Col sm={8}>
                            <FormItem label="项目是否过期：" labelCol={{ span: 20 }} wrapperCol={{ span: 4 }}>
                                <Switch onChange={this.expiredSwitchChange} checkedChildren={'是'} unCheckedChildren={'否'} checked={!this.state.expiredDisabled} />
                            </FormItem>
                            <FormItem label="是否显示项目：" labelCol={{ span: 20 }} wrapperCol={{ span: 4 }}>
                                <Switch onChange={this.displaySwitchChange} checkedChildren={'是'} unCheckedChildren={'否'} checked={!this.state.displayDisabled} />
                            </FormItem>
                            <FormItem wrapperCol={{ span: 4, offset: 20 }} style={{ marginTop: 50 }}>
                                <Button type="primary" htmlType="submit" onClick={this.saveConfigure}>保存</Button>
                            </FormItem>
                        </Col>
                    </Row>
                </Form>
            </Page>
        );

    }

});
ProjectFuncs = createForm()(ProjectFuncs);
export default ProjectFuncs;