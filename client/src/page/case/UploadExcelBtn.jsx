import './style.case.spreadsheet.less';
import React from 'react';
import { Tooltip, Modal, Button, Menu, Dropdown, Upload, Icon, message, Tabs, Table, Tag, Radio, Checkbox } from 'antd'
import PubSubMsg from '../../framework/common/pubsubmsg';
import Ajax from '../../framework/common/ajax';
import API from '../API';
import Funs from '../../framework/common/functions';
import Storage from '../../framework/common/storage';
const top_current_project = Funs.top_current_project + '_' + _USERINFO.userId;
const TabPane = Tabs.TabPane;
const DropdownButton = Dropdown.Button;
const RadioGroup = Radio.Group;
const CheckboxGroup = Checkbox.Group;

const ExcelTable = React.createClass({
  render() {
    const columns = [{
      title: '模块',
      dataIndex: 'B',
      width: 100
    }, {
      title: '用例标题',
      dataIndex: 'C',
      width: 200
    }, {
      title: '前提',
      dataIndex: 'D',
      width: 100
    }, {
      title: '步骤',
      dataIndex: 'E',
      width: 60
    }, {
      title: '步骤描述',
      dataIndex: 'F',
      width: 300
    }, {
      title: '期待结果',
      dataIndex: 'G',
      width: 300
    }, {
      title: '优先级',
      dataIndex: "H",
      width: 80,
      className: 'tdAlignCenter'
    }, {
      title: '编写人',
      dataIndex: 'I',
      width: 80
    }, {
      title: '日期',
      dataIndex: 'J',
      width: 100
    }];
    return (
      <div>
        <Table size="small" bordered columns={columns}
          rowKey={record => record._id}
          pagination={{
            pageSize: 5
          }}
          dataSource={this.props.data}
          />
      </div>
    )
  }
})


const UploadExcelBtn = React.createClass({
  getInitialState() {
    return {
      visible: false,
      exportVisible: false,
      modalType: 'upload',
      data: [],
      confirmLoading: false,
      uploadType: 1,
      exportType: "all",
      CheckboxVisible: "none",
      filterName: [],
      checkedValues: [],
      checked: false
    }
  },
  componentDidMount() {

  },
  handleButtonClick() {
    let isLeaf = this.props.isLeaf;
    let type = Storage.local.get(top_current_project) ? Storage.local.get(top_current_project).type : null;
    if (this.props.moduleId) {
      message.info('请先选择项目');
    } else {
      if (type == "product") {
        if (isLeaf == true) {
          this.setState({
            visible: true
          });
        } else {
          message.info("与PMS管理的项目，请在项目的叶子节点中导入用例");
        }
      } else {
        this.setState({
          visible: true
        });

      }

    }

    // if (this.props.projectId) {
    //   this.setState({
    //     visible: true
    //   });
    // } else {
    //   message.info('请先选择模块或项目');
    // }
  },
  handleMenuClick(e) {
    if (this.props.projectId) {
      this.setState({
        exportVisible: true
      });

    }
    else {
      message.info('请先选择模块或项目');
    }
  },
  handleExportOk() {
    const _this = this;
    if ((_this.state.CheckboxVisible == "") && (_this.state.filterName.length == 0)) {
      message.info("请勾选筛查条件", 3)
    } else {
      Ajax.post({
        url: API.EXPORT_EXCEL,
        data: {
          projectId: _this.props.projectId,
          moduleId: _this.props.moduleId,
          types: _this.props.types,
          filterName: _this.state.filterName
        },
        success(res) {
          const result = res.body;
          if (result && result.filepath) {
            message.info("导出Excel完成，浏览器将自动进行下载");
            setTimeout(function () { location.href = result.filepath; }, result.time * 1000 + 1000);
            _this.setState({
              exportVisible: false,
              filterName: [],
              checkedValues: [],
              exportType: "all",
              CheckboxVisible: "none",
              checked: false
            });
          } else {
            message.error('导出出现错误');
          }
        }
      })
    }


  },
  handleOk() {
    let caseExcel = [];
    this.state.data.forEach(item => {
      let caseInfos;
      if (item.isCanImport) {
        caseInfos = {
          moduleName: item.sheetName,
          moduleId: item.isExists,
          projectId: this.props.projectId,
          caseInfo: []
        };
        let ii = 0;
        item.sheetContent.forEach(da => {
          let caseInfo = {
            project: this.props.projectId,
            module: item.isExists,
            moduleName: da.B.trim(),
            casePurpose: da.C.trim(),
            casePremise: da.D.trim(),
            caseStep: da.E.trim(),
            caseStepDesc: da.F.trim(),
            caseExpectResult: da.G.trim(),
            casePriority: da.H.trim(),
            createUserName: da.I.trim(),
            createDateExcel: da.J.trim(),
            sort: ii
          };

          caseInfos.caseInfo.push(caseInfo);
          ii++;
        })
      }

      if (caseInfos) {
        caseExcel.push(caseInfos);
      }
    })

    if (caseExcel.length > 0) {
      let _this = this;
      this.setState({
        confirmLoading: true
      })
      Ajax.post({
        url: API.UPLOAD_EXCEL_IMPORT,
        data: {
          caseExcel: JSON.stringify(caseExcel),
          'type': Storage.local.get(top_current_project) ? Storage.local.get(top_current_project).type : null,
          'productId': Storage.local.get(top_current_project) ? Funs.decrypt(Storage.local.get(top_current_project).currentProject, Funs.secret) : null
        },
        success(res) {
          const result = res.body;

          if (result.status === 200) {
            _this.setState({
              visible: false,
              confirmLoading: false
            })

            message.info("已成功导入模板数据");

            PubSubMsg.publish('refresh-tree-data', {});
          }
        }
      })
    } else {
      message.info("没有需要保存的内容");
    }
  },
  handleCancel(e) {
    this.setState({
      visible: false,
      modalType: 'upload',
      data: []
    });
  },
  handleExportCancel(e) {
    this.setState({
      exportVisible: false,
      filterName: [],
      checkedValues: [],
      exportType: "all",
      CheckboxVisible: "none",
      checked: false
    });
  },
  handleChange(info) {
    if (info.file.status === 'error') {
      message.error('用例Excel模板，不符合模板规则，请确认');
      return;
    }

    if (info.file.status === 'done') {
      if (info.file.response.status === 200) {
        let data = info.file.response.data;

        if (data && data.length > 0) {
          this.setState({
            modalType: 'table',
            data: data
          })
        } else {
          message.error('用例Excel模板，不符合模板规则，请确认');
        }
      } else {
        message.error('用例Excel模板，不符合模板规则，请确认');
      }
    }
  },
  onBtnClick() {
    this.setState({
      modalType: 'upload',
      data: []
    })
  },
  onTypeChange(e) {
    this.setState({
      uploadType: e.target.value,
    });
  },
  onExportTypeChange(e) {
    this.setState({
      exportType: e.target.value,

    });
    if (e.target.value === "all") {
      this.setState({
        CheckboxVisible: "none",
        filterName: []
      });
    } else if (e.target.value === "filter") {
      this.setState({
        CheckboxVisible: ""
      });
    }
  },
  onCheckboxChange(checkedValues) {
    this.setState({
      checkedValues: checkedValues,
      filterName: checkedValues
    })
  },
  render() {
    const menu = (
      <Menu onClick={this.handleMenuClick}>
        <Menu.Item key="exportExcel">导出Excel用例</Menu.Item>
      </Menu>
    );
    const props = {
      name: 'file',
      data: {
        type: this.state.uploadType,
        projectId: this.props.projectId
      },
      showUploadList: false,
      onChange: this.handleChange,
      beforeUpload(file) {
        const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.type === 'application/vnd.ms-excel';
        if (!isExcel) {
          message.error('只能上传 Excel 文件哦！');
        }
        return isExcel;
      },
      action: API.UPLOAD_EXCEL
    };

    const tabPane = this.state.data.map((itemSheet, index) => {
      let tabTitle;
      if (itemSheet.isExists) {
        if (itemSheet.isCanImport) {
          tabTitle = (<span>{itemSheet.sheetName}<Tag color="blue">已存在</Tag></span>);
        } else {
          tabTitle = (<span>{itemSheet.sheetName}<Tag color="red">已存在数据，不可导入</Tag></span>);
        }
      } else {
        tabTitle = (<span>{itemSheet.sheetName}<Tag color="green">新增</Tag></span>);
      }

      return (
        <TabPane tab={tabTitle} key={itemSheet.sheetName + index}>
          <ExcelTable data={itemSheet.sheetContent} />
        </TabPane>
      )
    });

    const modalContent = this.state.modalType === 'upload' ? (
      <div>
        <Upload {...props}>
          <Button type="ghost">
            <Icon type="upload" /> 点击上传用例Excel
          </Button>
        </Upload>
        <RadioGroup style={{ marginLeft: 20 }} defaultValue={1} onChange={this.onTypeChange} value={this.state.uploadType}>
          <Radio key="a" value={1}>多标签模板</Radio>
          <Radio key="b" value={2}>单标签模板</Radio>
        </RadioGroup>
        <Tooltip placement="bottomRight" title="多标签模板下载">
          <a href="/assets/book/多标签页导入模板.xlsx" download>
            <Icon type="question-circle-o" />多标签模板下载
          </a>
        </Tooltip>
        &nbsp; &nbsp; &nbsp;
        <Tooltip placement="bottomRight" title="单标签模板下载">
          <a href="/assets/book/单标签页导入模板.xlsx" download>
            <Icon type="question-circle-o" />单标签模板下载
          </a>
        </Tooltip>
      </div>
    ) : (
        <div className="card-container">
          <Button type="primary" onClick={this.onBtnClick} style={{ marginBottom: 5 }}>重新上传</Button>

          <Tabs type="card" size="small">
            {tabPane}
          </Tabs>
        </div>
      );
    const plainOptions = [
      { label: '高', value: '高' },
      { label: '中', value: '中' },
      { label: '低', value: '低' },
    ];
    const exportModalContent = (
      <div >
        <RadioGroup style={{ marginLeft: 20 }} defaultValue={"all"} onChange={this.onExportTypeChange} value={this.state.exportType}>
          <Radio key="c" value={"all"}>全部用例</Radio>
          <Radio key="d" value={"filter"}>筛选用例 [优先级]</Radio>

        </RadioGroup>
        <div style={{ marginLeft: 240, marginTop: -18, display: this.state.CheckboxVisible }}>
          <CheckboxGroup style={{ marginLeft: 120 }} options={plainOptions} value={this.state.checkedValues} onChange={this.onCheckboxChange} >
          </CheckboxGroup>
        </div>
      </div >


    );
    return (
      <span>
        <Modal confirmLoading={this.state.confirmLoading} title="上传Excel用例" okText="保存入库" width="80%" maskClosable={false} visible={this.state.visible}
          onOk={this.handleOk} onCancel={this.handleCancel} >
          {modalContent}
        </Modal>
        <Modal title="导出Excel用例" okText="导出" width="80%" maskClosable={false} visible={this.state.exportVisible}
          onOk={this.handleExportOk} onCancel={this.handleExportCancel} >
          {exportModalContent}
        </Modal>
        <DropdownButton onClick={this.handleButtonClick} overlay={menu} type="primary">
          导入Excel用例
        </DropdownButton>
      </span>
    );
  }
});

export default UploadExcelBtn;
