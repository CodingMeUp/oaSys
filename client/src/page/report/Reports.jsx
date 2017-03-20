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
const RangePicker = DatePicker.RangePicker;
const top_current_project = Funs.top_current_project + '_' + _USERINFO.userId;
let Reports = React.createClass({
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
  makeRowTimesChart(){
      if(this.state.tableData && this.state.tableData.length > 0 && !this.state.haveMake){
              this.setState({
                haveMake:true,
                btnReportChart:true
              });
              var caseArr = [],verArr = [],timesArr = [];
              var nameArr =[];
              var data = [];
              for (var i = 0; i < this.state.tableData.length; i++) {
                var item = this.state.tableData[i];
                if(item.timesTotal > 0){
                 var obj = {};
                 obj.projectName = item.projectName;
                 var avgTimes = item.timesTotal / (item.versionTotal > 0?item.versionTotal:1); // 平均轮数
                 obj.times = avgTimes.toFixed(1); //小数点1位
                 if(item.timesTotal > 3){
                    data.push(obj);
                 }
                }
              };
            var Stat = G2.Stat;
            var Frame = G2.Frame;
            var frame = new Frame(data);
            frame = Frame.sort(frame, 'times'); // 将数据按照times 进行排序，由大到小
              var chart = new G2.Chart({
                id: 'times',
                width : 1500,
                height : 600,
                plotCfg: {
                  margin: [50,90,110,230]
                }
              });
                chart.source(frame);
                chart.axis('projectName',{
                  title: null
                });
                chart.coord('rect').transpose();
                chart.interval().position('projectName*times').label('times');
                chart.render();
               $('#times')[0].scrollIntoView(true); // 移动到图表处
          }else{
              message.info('亲，请先统计数据')
          }
  },
  makeRowVersionChart(){
      if(this.state.tableData && this.state.tableData.length > 0 && !this.state.haveMake){
              this.setState({
                haveMake:true,
                btnReportChart:true
              });
              var caseArr = [],verArr = [],timesArr = [];
              var nameArr =[];
              var data = [];
              for (var i = 0; i < this.state.tableData.length; i++) {
                var item = this.state.tableData[i];
                if(item.versionTotal > 0){
                 var obj = {};
                 obj.projectName = item.projectName;
                 obj.version = item.versionTotal;
                 data.push(obj);
                }
              };
            var Stat = G2.Stat;
            var Frame = G2.Frame;
            var frame = new Frame(data);
            frame = Frame.sort(frame, 'version'); // 将数据按照version 进行排序，由大到小
              var chart = new G2.Chart({
                id: 'version',
                width : 1500,
                height : 600,
                plotCfg: {
                  margin: [50,90,110,230]
                }
              });
                chart.source(frame);
                chart.axis('projectName',{
                  title: null
                });
                chart.coord('rect').transpose();
                chart.interval().position('projectName*version').label('version');
                chart.render();
               $('#version')[0].scrollIntoView(true); // 移动到图表处
          }else{
              message.info('亲，请先统计数据')
          }
  },
  makeRowChart(){
      if(this.state.tableData && this.state.tableData.length > 0 && !this.state.haveMake){
              this.setState({
                haveMake:true,
                btnReportChart:true
              });
              var caseArr = [],verArr = [],timesArr = [];
              var nameArr =[];
              for (var i = 0; i < this.state.tableData.length; i++) {
                var item = this.state.tableData[i];
                if(item.versionTotal > 0){
                  caseArr.push(item.caseTotal);
                  verArr.push(item.versionTotal);
                  timesArr.push(item.timesTotal);
                  nameArr.push(item.projectName);
                }
              };
               var data = [
                  {name: '用例总数',data: caseArr},
                  {name: '版本总数',data: verArr},
                  {name: '轮数总数',data: timesArr},
             ];
            for(var i=0; i < data.length; i++) {
              var item = data[i];
              var datas = item.data;
              var months = nameArr;
              for(var j=0; j < datas.length; j++) {
                item[months[j]] = datas[j];
              }
              data[i] = item;
            }
            var Stat = G2.Stat;
            var Frame = G2.Frame;
            var frame = new Frame(data);
            frame = Frame.combinColumns(frame, nameArr,'数目','.','name');

           //frame = Frame.sort(frame, 'population'); // 将数据按照population 进行排序，由大到小
            var chart = new G2.Chart({
              id: 'c1',
              width : 1500,
              height : 600,
              plotCfg: {
                margin: [50,90,110,90]
              }
            });
            chart.source(frame);
            chart.col('name',{alias: '类别'});
            chart.intervalDodge().position('.*数目').color('name').label('数目');
            chart.render();

           $('#c1')[0].scrollIntoView(true); // 移动到图表处
            this.makeRowVersionChart();
            this.makeRowTimesChart();
          }else{
              message.info('亲，请先统计数据')
          }

  },
  makeChart(){
      if(this.state.tableData && this.state.tableData.length > 0 && !this.state.haveMake){
              this.setState({
                haveMake:true,
                btnReportChart:true
              });
              var caseArr = [],verArr = [],timesArr = [];
              var nameArr =[];
              for (var i = 0; i < this.state.tableData.length; i++) {
                var item = this.state.tableData[i];
                if(item.versionTotal > 0){
                  caseArr.push(item.caseTotal);
                  verArr.push(item.versionTotal);
                  timesArr.push(item.timesTotal);
                  nameArr.push(item.projectName);
                }
              };
               var data = [
                  {name: '用例总数',data: caseArr},
                  {name: '版本总数',data: verArr},
                  {name: '轮数总数',data: timesArr},
             ];
            for(var i=0; i < data.length; i++) {
              var item = data[i];
              var datas = item.data;
              var months = nameArr;
              for(var j=0; j < datas.length; j++) {
                item[months[j]] = datas[j];
              }
              data[i] = item;
            }
            var Stat = G2.Stat;
            var Frame = G2.Frame;
            var frame = new Frame(data);
            frame = Frame.combinColumns(frame, nameArr,'数目','.','name');

           //frame = Frame.sort(frame, 'population'); // 将数据按照population 进行排序，由大到小
            var chart = new G2.Chart({
              id: 'c1',
              // container:this.refs.c1,
              width : 1500,
              height : 600,
              plotCfg: {
                margin: [50,90,110,90]
              }
            });
            chart.source(frame);
            chart.col('name',{alias: '类别'});
            chart.intervalDodge().position('.*数目').color('name').label('数目');
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
     Ajax.get({
      url: API.REPORT_DO,
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
        });
        $("#c1").empty(); //清空图表
        $("#version").empty(); //清空图表
        $("#times").empty(); //清空图表
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
  countAndChartGT3Times() {
    let _this = this;

    if(!!(_this.state.startDate && _this.state.endDate) ){
     Ajax.get({
      url: API.REPORT_ALL_GT3_DO,
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

         return;
        // _this.setState({
        //   tableData: data,
        //   loading: false,
        //   haveMake:false,
        //   btnReportChart:false
        // },function(){
        //   $("#c1").empty(); //清空图表
        //   _this.makeRowChart();
        // });
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
        <h1 className="admin-page-header-title">项目用例报表统计</h1>
        <Breadcrumb>
          <Breadcrumb.Item>首页</Breadcrumb.Item>
          <Breadcrumb.Item>项目执行报表</Breadcrumb.Item>
        </Breadcrumb>
      </div>

    return (
      <Page header={pageHeader} loading={this.state.loading}>

        <div>
          <RangePicker style={{ width: 184 ,marginRight:20}} onChange={this.onChange} />
          <ButtonGroup>
              <Button onClick={this.startReport}  >开始统计</Button>

              <Button type='primary' onClick={this.makeChart} disabled={this.state.btnReportChart} >生成柱状图表</Button>
          </ButtonGroup>
          <Button type='primary' style={{ 'float':'right','marginLeft':10}} onClick={this.countAndChartGT3Times}  >统计大于三轮的版本轮数</Button>
          <Button type='primary' style={{ 'float':'right'}} onClick={this.countAndChart}>所有项目统计报表</Button>
        </div>

        <div>
          <Table bordered columns={colums}
            rowKey={this.rowKeyMake}
            dataSource={this.state.tableData}
            onChange={this.handleChange}
            pagination={false}
            />

        </div>
        <div id="c1" ref = 'c1'></div>

        <div id="c2" ref = 'c2'></div>
        <div id="version" ref = 'version'></div>
        <div id="times" ref = 'times'></div>
      </Page>
    );
  }
});

export default Reports;