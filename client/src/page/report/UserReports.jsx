import './style.less';
import React from 'react';
import ReactDOM from 'react-dom';
import reqwest from 'reqwest';
import G2 from 'g2';
import $ from 'jquery';
import moment from 'moment';
import { DatePicker, Breadcrumb, Popconfirm, Table, message, Modal, Input, InputNumber, Checkbox, Form, Button, Icon, Tooltip, Tag, Menu, Dropdown } from 'antd'
import Page from '../../framework/page/Page';
import Ajax from '../../framework/common/ajax';
import Storage from '../../framework/common/storage';
import Funs from '../../framework/common/functions';
import API from '../API';
import SearchInput from '../ctrl/SearchInput';
const ButtonGroup = Button.Group;
const top_current_project = Funs.top_current_project + '_' + _USERINFO.userId;
const RangePicker = DatePicker.RangePicker;
let UserReports = React.createClass({
  getInitialState() {
    return {
      loading: true,
      startDate: '',
      endDate: '',
      sortedValue:{
         order: 'descend',
         columnKey: 'caseTotal',
      },
      filteredValue: {},
      tableData: [],
      btnReportChart:true,
      haveMake:false,
    }
  },
 handleChange(pagination, filters, sorter) {
    this.setState({
      filteredValue: filters,
      sortedValue: sorter,
    });
  },
  componentDidMount() {
    this.setState({ loading: false });
  },

  onChange(value, dateString) {
    let _this = this;
    _this.setState({
      startDate: dateString[0],
      endDate: dateString[1]
    })
  },
  makeChart(){
      if(this.state.tableData && this.state.tableData.length > 0 && !this.state.haveMake){
              this.setState({
                haveMake:true,
                btnReportChart:true
              });
             var data = [];
             var imageMap = {};

             for (var i = 0; i < this.state.tableData.length; i++) {
               var item  = this.state.tableData[i];
               var obj = {};
               obj.name = item.userName;
               obj.active = item.active;
               obj.userId = item.userId;
               obj.iconURL = 'http://cs.101.com/v0.1/static/cscommon/avatar/' + item.userId + '/' + item.userId + '.jpg?size=480';
               data.push(obj);
             };


             for (var i = 0; i < data.length; i++) {
               var item  = data[i];
               imageMap[item.name] = item.iconURL;
             };

              // 自定义 shape, 支持图片形式的气泡
              var Shape = G2.Shape;
              Shape.registShape('interval', 'image-top', {
                drawShape: function(cfg, container) {
                  var points = cfg.points; // 点从左下角开始，顺时针方向
                  var path = [];
                  path.push(['M', points[0].x, points[0].y]);
                  path.push(['L', points[1].x, points[1].y]);
                  path = this.parsePath(path);
                  container.addShape('rect', {
                    attrs: {
                      x: cfg.x - 30,
                      y: path[1][2], // 矩形起始点为左上角
                      width: 60,
                      height: path[0][2] - cfg.y,
                      fill: cfg.color,
                      radius: 10
                    }
                  });
                  return container.addShape('image', {
                    attrs: {
                      x: cfg.x - 20,
                      y: cfg.y - 20,
                      width: 40,
                      height: 40,
                      img: cfg.shape[1]
                    }
                  });
                }
              });
              var chart = new G2.Chart({
                id : 'c1',
                width : 1600,
                height : 600
              });
              chart.source(data, {
                active: {
                  min: 0
                }
              });
              chart.legend(false);
              chart.axis('active', {
                labels: null,
                title: null,
                line: null,
                tickLine: null
              });
              chart.axis('name', {
                title: null
              });
              chart.interval().position('name*active').color('name', ['#7f8da9', '#fec514', '#db4c3c', '#daf0fd'])
                .shape('name', function(name){
                return ['image-top', imageMap[name]]; // 根据具体的字段指定 shape
              });
              chart.render();

           $('#c1')[0].scrollIntoView(true); // 移动到图表处
            // ReactDOM.render(chart);
          }else{
              message.info('亲，请先统计数据')
          }

  },
  startReport() {
    let _this = this;

    if(!!(_this.state.startDate && _this.state.endDate) ){
     Ajax.post({
      url: API.REPORT_USER_ACTIVE,
      data: {
          startDate: _this.state.startDate,
          endDate: _this.state.endDate,
          header:Storage.local.get(top_current_project) ? Funs.decrypt(Storage.local.get(top_current_project).currentProject, Funs.secret) : null,
          type:Storage.local.get(top_current_project) ?Storage.local.get(top_current_project).type : null
      },
      before() {
        _this.setState({
          loading: true
        })
      },
      success(res) {
        var data = res.body.data;
        _this.setState({
          tableData: data,
          loading: false,
          haveMake:false,
          btnReportChart:false
        });
        $("#c1").empty(); //清空图表

      }
    })
    }else{
            message.info('请选择时间区间');
    }

  },
  countAndChart() {
    let _this = this;

    if(!!(_this.state.startDate && _this.state.endDate) ){
     Ajax.get({
      url: API.REPORT_ALL_DO,
      data: {
          startDate: _this.state.startDate,
          endDate: _this.state.endDate
      },
      before() {
        _this.setState({
          loading: true
        })
      },
      success(res) {
        var data = res.body.data;

        _this.setState({
          tableData: data,
          loading: false,
          haveMake:false,
          btnReportChart:false
        },function(){
          $("#c1").empty(); //清空图表
          _this.makeRowChart();

        });

      }
    })
    }else{
            message.info('请选择时间区间');
    }

  },
  rowKeyMake(e) {
    return e._id;
  },
  render() {
    const { sortedValue, filteredValue } = this.state;
     sortedValue.column = sortedValue.column || {};
    const colums = [{
      title: '项目名称',
      width: 200,
      dataIndex: 'projectName',
      // fixed:true,
      render(o,row,e){
          return  row.type === 'product'?`【产品】${o}`: o;
      }
    },
    /* {
      title: '开始时间',
      width: 100,
      dataIndex: 'startDate'
    },
    {
      title: '结束时间',
      width: 100,
      dataIndex: 'endDate'
    }, */
     {
      title: '总用例数',
      width: 100,
      dataIndex: 'caseTotal',
      key: 'caseTotal',
      sorter: (a, b) => a.caseTotal - b.caseTotal,
      sortOrder: sortedValue.columnKey === 'caseTotal' && sortedValue.order,
    },
    {
      title: '总版本数',
      width: 100,
      dataIndex: 'versionTotal'
    }, {
      title: '总轮数',
      width: 50,
      dataIndex: 'timesTotal'
    }
    /*, {
      title: '版本总时间',
      width: 100,
      dataIndex: 'versionCountTime'
    }*/
    ];


    const pageHeader =
      <div>
        <h1 className="admin-page-header-title">用户报表统计</h1>
        <Breadcrumb>
          <Breadcrumb.Item>首页</Breadcrumb.Item>
          <Breadcrumb.Item>用户报表</Breadcrumb.Item>
        </Breadcrumb>
      </div>

    return (
      <Page header={pageHeader} loading={this.state.loading}>

        <div>
          <RangePicker style={{ width: 184 ,marginRight:20}} onChange={this.onChange} />
          <ButtonGroup>
              <Button onClick={this.startReport}  >开始统计</Button>
              <Button type='primary' onClick={this.makeChart} disabled={this.state.btnReportChart} >生成自定义柱状图表</Button>
          </ButtonGroup>


        </div>

       { /*<div>
          <Table bordered columns={colums}
            rowKey={this.rowKeyMake}
            dataSource={this.state.tableData}
            onChange={this.handleChange}
            pagination={false}
            />
        </div>*/}
        <div id="c1" ref = 'c1'></div>


      </Page>
    );
  }
});

export default UserReports;