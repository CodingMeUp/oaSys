import React from 'react';
import { Breadcrumb, Button, Menu, Icon, Tree, Tooltip, Spin, message, Modal, Select, Dropdown, Table, Tabs, Form, Input, Upload } from 'antd';
import BUG_LANG from './BugLang';
import $ from 'jquery';
import _ from 'lodash';

const Option = Select.Option;

export default {
  actionHistorys: function (arr) {
    return arr.map(item => {

      let content = '';
      content = BUG_LANG.bugActionDesc[item.action.toLowerCase()] && (BUG_LANG.bugActionDesc[item.action.toLowerCase()](item));
      content = (!content && BUG_LANG.bugDesc[item.action.toLowerCase()]) ? BUG_LANG.bugDesc[item.action.toLowerCase()](item) : content;

      let historyStr = '';
      item.history.forEach(his => {
        if (his.diff) {
          let diff = his.diff;
          diff = diff.replace(/<ins>/gi, '[ins]');
          diff = diff.replace(/\<\/ins\>/gi, '[/ins]');
          diff = diff.replace(/\<del\>/gi, '[del]');
          diff = diff.replace(/\<\/del\>/gi, '[/del]');
          if ((his.field != 'subversion' && his.field != 'git')) {
            diff = diff.replace(/<[^>]+>/gi, "");
          }
          diff = diff.replace(/\[ins\]/gi, '<ins>');
          diff = diff.replace(/\[\/ins\]/gi, '</ins>');
          diff = diff.replace(/\[del\]/gi, '<del>');
          diff = diff.replace(/\[\/del\]/gi, '</del>');
          diff = diff.replace(/(\r\n|\n\r|\r|\n)/g, "<br />");
          let noTagDiff = diff.replace(/&lt;\/?([a-z][a-z0-9]*)[^\/]*\/?&gt;/gi, '');
          historyStr += BUG_LANG.bugDesc['diff2'](BUG_LANG.bugFiled[his.field], noTagDiff, diff);
        } else {
          historyStr += BUG_LANG.bugDesc['diff1'](BUG_LANG.bugFiled[his.field] ? BUG_LANG.bugFiled[his.field] : his.field, his.old, his['new']);
        }
      });
      const iconOpenClose = historyStr ? '<a class="openClose"><i class="fa fa-plus"></i></a>' : '';
      content = content ? '<span>' + content + iconOpenClose + '</span>' : '';

      if (item.comment) {
        content += '<div class="history">';
      }
      if (historyStr) {
        content += '<div class="changes hide alert">';
        content += historyStr;
        content += '</div>';
      }
      if (item.comment) {
        content += '<div class="article-content comment_' + item.id + '">';
        content += item.comment;
        content += '</div>';
      }
      if (item.comment) {
        content += '</div>';
      }

      return (<li key={item.id} dangerouslySetInnerHTML={{ __html: content }}></li>);
    });
  },

  addHistoryJQueryOperationt: function () {
    $('body').on('click', '.openOrClose', function (event) {
      let _this = $(this);
      var hasOpenAll = _this.hasClass('openAll');
      $('.historyItem li').each(function (i, item) {
        let divFind = $(item).find('.changes');
        let aIconFind = $(item).find('.openClose');
        if (divFind.length > 0) {
          let div = divFind[0];
          let aIcon = aIconFind[0];
          if (!hasOpenAll) {
            $(div).removeClass('hide');
            $(aIcon).html('<i class="fa fa-minus"></i>');
          } else {
            $(div).addClass('hide');
            $(aIcon).html('<i class="fa fa-plus"></i>');
          }
        }
      });

      if (!hasOpenAll) {
        _this.addClass('openAll');
        _this.html('<i class="fa fa-minus"></i>');
      } else {
        _this.removeClass('openAll');
        _this.html('<i class="fa fa-plus"></i>');
      }
    });

    $('body').on('click', '.openClose', function (event) {
      let div = $(this).parent().parent().find('.changes')[0];
      if ($(div).hasClass('hide')) {
        $(div).removeClass('hide');
        $(this).html('<i class="fa fa-minus"></i>');
      } else {
        $(div).addClass('hide');
        $(this).html('<i class="fa fa-plus"></i>');
      }
    });
  },

  getBugSelectOptions() {

     // 2017.1.12 cyn 漏测和平台字段 start
     let platformOptions = [];
     for (let p in BUG_LANG.platformList) {
      platformOptions.push(<Option value={parseInt(p) } key={`stage_${p}`}>{BUG_LANG.platformList[p]}</Option>);
    }
    let lostTestOptions = [];
     for (let p in BUG_LANG.lostTestList) {
      lostTestOptions.push(<Option value={parseInt(p) } key={`stage_${p}`}>{BUG_LANG.lostTestList[p]}</Option>);
    }
    let discoveryPhaseOptions = [];
     for (let p in BUG_LANG.discoveryPhaseList) {
      discoveryPhaseOptions.push(<Option value={parseInt(p) } key={`stage_${p}`}>{BUG_LANG.discoveryPhaseList[p]}</Option>);
    }
    //2017.1.25 cyn 发现阶段 漏测修改 相关产品 OA
    //end
    let stageOptions = [];
    for (let p in BUG_LANG.stageList) {
      stageOptions.push(<Option value={parseInt(p) } key={`stage_${p}`}>{BUG_LANG.stageList[p]}</Option>);
    }
    let severityOptions = [];
    for (let p in BUG_LANG.severityList) {
      severityOptions.push(<Option value={parseInt(p) } key={`severity_${p}`}>{BUG_LANG.severityList[p]}</Option>);
    }
    let typeOptions = [];
    for (let p in BUG_LANG.typeList) {
      typeOptions.push(<Option value={p} key={`type_${p}`}>{BUG_LANG.typeList[p]}</Option>);
    }
    let osOptions = [];
    for (let p in BUG_LANG.osList) {
      osOptions.push(<Option value={p} key={`os_${p}`}>{BUG_LANG.osList[p]}</Option>);
    }
    let browserOptions = [];
    for (let p in BUG_LANG.browserList) {
      browserOptions.push(<Option value={p} key={`os_${p}`}>{BUG_LANG.browserList[p]}</Option>);
    }
    let difficultyOptions = [];
    for (let p in BUG_LANG.difficultyList) {
      difficultyOptions.push(<Option value={parseInt(p) } key={`difficulty_${p}`}>{BUG_LANG.difficultyList[p]}</Option>);
    }
    let priOptions = [];
    for (let p in BUG_LANG.priList) {
      priOptions.push(<Option value={parseInt(p) } key={`pri_${p}`}>{BUG_LANG.priList[p]}</Option>);
    }
    let statusOptions = [];
    for (let p in BUG_LANG.statusList) {
      statusOptions.push(<Option value={p} key={`status_${p}`}>{BUG_LANG.statusList[p]}</Option>);
    }
    let confirmedOptions = [];
    for (let p in BUG_LANG.confirmedList) {
      confirmedOptions.push(<Option value={parseInt(p) } key={`confirmed_${p}`}>{BUG_LANG.confirmedList[p]}</Option>);
    }
    let resolutionOptions = [];
    for (let p in BUG_LANG.resolutionList) {
      resolutionOptions.push(<Option value={p} key={`resolution_${p}`}>{BUG_LANG.resolutionList[p]}</Option>);
    }

    return {
      stageOptions: stageOptions,
      severityOptions: severityOptions,
      typeOptions: typeOptions,
      osOptions: osOptions,
      browserOptions: browserOptions,
      difficultyOptions: difficultyOptions,
      priOptions: priOptions,
      statusOptions: statusOptions,
      confirmedOptions: confirmedOptions,
      resolutionOptions: resolutionOptions,
      platformOptions:platformOptions,
      lostTestOptions:lostTestOptions,
      discoveryPhaseOptions:discoveryPhaseOptions
    }
  },

  getBugOtherSelectOptions: function (productList, projectList, taskList, storys, users, builds, modules) {
    const productOptions = productList.map(d => <Option searchValue={d.name} value={d.id} key={d.id}>{d.name}</Option>);
    const projectOptions = projectList.map(d => <Option searchValue={d.name} value={d.id} key={d.id}>{d.name}</Option>);
    const taskOptions = taskList.map(d => <Option searchValue={d.name} value={d.id} key={d.id}>{d.id + '::' + d.name}</Option>);
    const storyOptions = storys.map(d => <Option searchValue={d.title} value={d.id} key={d.id}>{d.id + '::' + d.title}</Option>);
    const usersOptions = users ? users.map(d => {
      let nicknameFirstChar = '';
      for (let i = 0; i < d.nickname.length; i++) {
         if (/^[A-Z]+$/.test( d.nickname.charAt(i) )) {
           nicknameFirstChar += d.nickname.charAt(i);
         }
      }
      let searchValue = nicknameFirstChar.toLowerCase() + '_' + d.account99 + '_' + d.nickname.toLowerCase() + '_' + d.realname;
      return (
        <Option
          searchValue={searchValue}
          key={d.account}
          value={d.account}>
          {d.realname + '(' + d.account99 + ')'}
        </Option>
      );
    }) : [];
    //轮数和解决版本的倒序问题 object对象key排序无序倒置。
 	  let buildOptions = [];
    let keyArr = _.keys(builds);
    let valueArr = _.values(builds);
    for( var i = keyArr.length;i >= 0;i--){
      if(keyArr[i] && valueArr[i]){
        buildOptions.push(<Option value={keyArr[i]} key={`builds_${keyArr[i]}`}>{valueArr[i]}</Option>);
      }
    }

    let moduleOptions = [<Option value={0} key="option_module_o">/</Option>];
    if (modules) {
      const fun = (arr) => {
        if (arr && arr.length > 0) {
          arr.forEach(item => {
            moduleOptions.push(<Option value={item.id} key={item.id}>/{item.pathName.replace(/\[@\]/g, '/') }</Option>);
            fun(item.children);
          });
        }
      }

      fun(modules);
    }

    return {
      productOptions: productOptions,
      projectOptions: projectOptions,
      taskOptions: taskOptions,
      storyOptions: storyOptions,
      usersOptions: usersOptions,
      buildOptions: buildOptions,
      moduleOptions: moduleOptions
    }
  }
};
