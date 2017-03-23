import moment from 'moment';

const BUG_LANG = function() {
  this.confirmedList = {
    '0': '未确认',
    '1': '已确认'
  };

  this.statusList = {
    '': '　',
    'active': '激活',
    'resolved': '已解决',
    'closed': '已关闭'
  };
  this.priList = {
    // '0': '　',
    '1': '不急',
    '2': '一般',
    '3': '尽快',
    '4': '紧急'
  };
  this.severityList = {
    '1': '建议',
    '2': '轻微',
    '3': '一般',
    '4': '严重',
    '5': '致命'
  };
  this.resolutionList = {
    '': '　',
    'bydesign': '设计如此',
    'duplicate': '重复Bug',
    'external': '外部原因',
    'fixed': '已解决',
    'notrepro': '无法重现',
    'postponed': '延期处理',
    'willnotfix': '不予解决',
    'tostory': '转为需求',
    'invalid': '无效Bug'
  };
  this.difficultyList = {
    // '0': '　',
    '1': '简单',
    '2': '中等',
    '3': '困难'
  };
  this.stageList = {
    '0': '　',
    '1': '开发',
    '2': '测试',
    '3': '预生产',
    '4': '正式',
    '5': '集成',
    '6': '压测'
  };
  this.platformList = {    // 2017.1.12 cyn 平台
      // '0': '　',
      '1': 'IOS',
      '2': 'Web',
      '3': 'PC',
      '4': 'Android',
      '5': '服务端'
  };
   this.lostTestList = { // 2017.1.12  1.25 cyn 是否漏测
      // '0': '　',
      '1': '非漏测',
      '2': '版本间漏测（内部）',
      '3': '轮间漏测（内部）',
      '4': '外部漏测'
  };
   this.discoveryPhaseList = { // 1.25 cyn 发现阶段
      '0': '',
      '1': '设计',
      '2': '开发',
      '3': '测试',
      '4': '发布'
  };
  this.typeList = { // 2017.1.12 cyn BUG类型
    '': '　',
    'codeerror': '代码错误',
    'interface': '页面问题',
    'designdefect': '代码设计缺陷',
    'codemodifyerror': '代码修改引发问题',
    'config': '配置相关',
    'install': '打包升级安装部署',
    'security': '代码安全',
    'performance': '客户端性能',
    'requirementProblem': '需求问题',
    'standard': '标准规范', //10
    'automation': '测试脚本',
    'databaseAspect': '数据库相关',
    'usabilityProblem': '易用性问题',
    'adaptiveProblem': '适配问题',
    'operationtProblem': '运维问题',
    'unknown': '未知',
    'others': '其他',
    'inconsistent': '实现误差' //18
        // 'trackthings': '事务跟踪',
  };
  this.osList = {
    '': '　',
    'all': '全部',
    'windows': 'Windows',
    'win8': 'Windows 8',
    'win7': 'Windows 7',
    'vista': 'Windows Vista',
    'winxp': 'Windows XP',
    'win2012': 'Windows 2012',
    'win2008': 'Windows 2008',
    'win2003': 'Windows 2003',
    'win2000': 'Windows 2000',
    'android': 'Android',
    'ios': 'IOS',
    'wp8': 'WP8',
    'wp7': 'WP7',
    'symbian': 'Symbian',
    'linux': 'Linux',
    'freebsd': 'FreeBSD',
    'osx': 'OS X',
    'unix': 'Unix',
    'others': '其他'
  };
  this.browserList = {
    '': '　',
    'all': '全部',
    'ie': 'IE系列',
    'ie11': 'IE11',
    'ie10': 'IE10',
    'ie9': 'IE9',
    'ie8': 'IE8',
    'ie7': 'IE7',
    'ie6': 'IE6',
    'chrome': 'chrome',
    'firefox': 'firefox系列',
    'firefox4': 'firefox4',
    'firefox3': 'firefox3',
    'firefox2': 'firefox2',
    'opera': 'opera系列',
    'oprea11': 'opera11',
    'oprea10': 'opera10',
    'opera9': 'opera9',
    'safari': 'safari',
    'maxthon': '傲游',
    'uc': 'UC',
    'others': '其他'
  };
  this.bugDesc = {
    'common': (item) => `${moment(item.date).format('YYYY-MM-DD HH:mm:ss')}; <strong>${item.action}</strong> by <strong>${item.actor}</strong>。`,
    'extra': (item) => `${moment(item.date).format('YYYY-MM-DD HH:mm:ss')}; <strong>${item.action}</strong> as <strong>${item.extra}</strong> by <strong>${item.actor}</strong>。`,
    'opened': (item) => `${moment(item.date).format('YYYY-MM-DD HH:mm:ss')}; 由 <strong>${item.actor}</strong> 创建。`,
    'created': (item) => `${moment(item.date).format('YYYY-MM-DD HH:mm:ss')}; 由 <strong>${item.actor}</strong> 创建。`,
    'changed': (item) => `${moment(item.date).format('YYYY-MM-DD HH:mm:ss')}; 由 <strong>${item.actor}</strong> 变更。`,
    'edited': (item) => `${moment(item.date).format('YYYY-MM-DD HH:mm:ss')}; 由 <strong>${item.actor}</strong> 编辑。`,
    'assigned': (item) => `${moment(item.date).format('YYYY-MM-DD HH:mm:ss')}; 由 <strong>${item.actor}</strong> 指派给 <strong>${item.extra}</strong>。`,
    'closed': (item) => `${moment(item.date).format('YYYY-MM-DD HH:mm:ss')}; 由 <strong>${item.actor}</strong> 关闭。`,
    'deleted': (item) => `${moment(item.date).format('YYYY-MM-DD HH:mm:ss')}; 由 <strong>${item.actor}</strong> 删除。`,
    'deletedfile': (item) => `${moment(item.date).format('YYYY-MM-DD HH:mm:ss')}; 由 <strong>${item.actor}</strong> 删除了附件：<strong><i>${item.extra}</i></strong>。`,
    'editfile': (item) => `${moment(item.date).format('YYYY-MM-DD HH:mm:ss')}; 由 <strong>${item.actor}</strong> 编辑了附件：<strong><i>${item.extra}</i></strong>。`,
    'erased': (item) => `${moment(item.date).format('YYYY-MM-DD HH:mm:ss')}; 由 <strong>${item.actor}</strong> 删除。`,
    'undeleted': (item) => `${moment(item.date).format('YYYY-MM-DD HH:mm:ss')}; 由 <strong>${item.actor}</strong> 还原。`,
    'hidden': (item) => `${moment(item.date).format('YYYY-MM-DD HH:mm:ss')}; 由 <strong>${item.actor}</strong> 隐藏。`,
    'commented': (item) => `${moment(item.date).format('YYYY-MM-DD HH:mm:ss')}; 由 <strong>${item.actor}</strong> 添加备注。`,
    'activated': (item) => `${moment(item.date).format('YYYY-MM-DD HH:mm:ss')}; 由 <strong>${item.actor}</strong> 激活。`,
    'moved': (item) => `${moment(item.date).format('YYYY-MM-DD HH:mm:ss')}; 由 <strong>${item.actor}</strong> 移动，之前为 "${item.extra}"。`,
    'confirmed': (item) => `${moment(item.date).format('YYYY-MM-DD HH:mm:ss')}; 由 <strong>${item.actor}</strong> 确认需求变动，最新版本为<strong>#${item.extra}</strong>。`,
    'caseconfirmed': (item) => `${moment(item.date).format('YYYY-MM-DD HH:mm:ss')}; 由 <strong>${item.actor}</strong> 确认OA变动，最新版本为<strong>#${item.extra}</strong>。`,
    'bugconfirmed': (item) => `${moment(item.date).format('YYYY-MM-DD HH:mm:ss')}; 由 <strong>${item.actor}</strong> 确认Bug。`,
    'frombug': (item) => `${moment(item.date).format('YYYY-MM-DD HH:mm:ss')}; 由 <strong>${item.actor}</strong> Bug转化而来，Bug编号为 <strong>${item.extra}</strong>。`,
    'started': (item) => `${moment(item.date).format('YYYY-MM-DD HH:mm:ss')}; 由 <strong>${item.actor}</strong> 启动。`,
    'restarted': (item) => `${moment(item.date).format('YYYY-MM-DD HH:mm:ss')}; 由 <strong>${item.actor}</strong> 继续。`,
    'delayed': (item) => `${moment(item.date).format('YYYY-MM-DD HH:mm:ss')}; 由 <strong>${item.actor}</strong> 延期。`,
    'suspended': (item) => `${moment(item.date).format('YYYY-MM-DD HH:mm:ss')}; 由 <strong>${item.actor}</strong> 挂起。`,
    'recordestimate': (item) => `${moment(item.date).format('YYYY-MM-DD HH:mm:ss')}; 由 <strong>${item.actor}</strong> 记录工时，消耗 <strong>${item.extra}</strong> 小时。`,
    'editestimate': (item) => `${moment(item.date).format('YYYY-MM-DD HH:mm:ss')}; 由 <strong>${item.actor}</strong> 编辑工时。`,
    'deleteestimate': (item) => `${moment(item.date).format('YYYY-MM-DD HH:mm:ss')}; 由 <strong>${item.actor}</strong> 删除工时。`,
    'canceled': (item) => `${moment(item.date).format('YYYY-MM-DD HH:mm:ss')}; 由 <strong>${item.actor}</strong> 取消。`,
    'svncommited': (item) => `${moment(item.date).format('YYYY-MM-DD HH:mm:ss')}; 由 <strong>${item.actor}</strong> 提交代码，版本为<strong>#${item.extra}</strong>。`,
    'gitcommited': (item) => `${moment(item.date).format('YYYY-MM-DD HH:mm:ss')}; 由 <strong>${item.actor}</strong> 提交代码，版本为<strong>#${item.extra}</strong>。`,
    'finished': (item) => `${moment(item.date).format('YYYY-MM-DD HH:mm:ss')}; 由 <strong>${item.actor}</strong> 完成。`,
    'paused': (item) => `${moment(item.date).format('YYYY-MM-DD HH:mm:ss')}; 由 <strong>${item.actor}</strong> 暂停。`,
    'diff1': (str, old, newVal) => `修改了 <strong><i>${str}</i></strong>，旧值为 "${old}"，新值为 "${newVal}"。<br />`,
    'diff2': (str, old, newVal) => `修改了 <strong><i>${str}</i></strong>，区别为：<blockquote>${old}</blockquote><div class='hidden'>${newVal}</div>`,
    'diff3': (old, newVal) => `将文件名 ${old} 改为 ${newVal} 。`,
  };
  this.bugActionDesc = {
    'resolved': (item) => `${moment(item.date).format('YYYY-MM-DD HH:mm:ss')}; 由 <strong>${item.actor}</strong> 解决，方案为 <strong>${item.extra}</strong>。`,
    'tostory': (item) => `${moment(item.date).format('YYYY-MM-DD HH:mm:ss')}; 由 <strong>${item.actor}</strong> 转为<strong>需求</strong>，编号为 <strong>${item.extra}</strong>。`,
    'totask': (item) => `${moment(item.date).format('YYYY-MM-DD HH:mm:ss')}; 由 <strong>${item.actor}</strong> 导入为<strong>任务</strong>，编号为 <strong>${item.extra}</strong>。`,
    'linked2plan': (item) => `${moment(item.date).format('YYYY-MM-DD HH:mm:ss')}; 由 <strong>${item.actor}</strong> 关联到计划 <strong>${item.extra}</strong>。`,
    'unlinkedfromplan': (item) => `${moment(item.date).format('YYYY-MM-DD HH:mm:ss')}; 由 <strong>${item.actor}</strong> 从计划 <strong>${item.extra}</strong> 移除。`
  };
  this.bugFiled = {
    'common': 'Bug',
    'id': 'Bug编号',
    'product': '所属产品',
    'productplan': '所属计划',
    'module': '所属模块',
    'path': '模块路径',
    'project': '版本',
    'story': '相关需求',
    'storyVersion': '需求版本',
    'task': '相关任务',
    'title': 'Bug标题',
    'severity': '严重程度',
    'severityAB': '级别',
    'pri': '优先级',
    'type': 'Bug类型',
    'os': '操作系统',
    'plan': '所属计划',
    'platform':'平台',
    'lostTest':'是否漏测',
    'discoveryPhase':'发现阶段',
    'linkedProduct':'关联产品',
    'hardware': '硬件平台',
    'browser': '浏览器',
    'machine': '机器硬件',
    'found': '如何发现',
    'steps': '重现步骤',
    'status': 'Bug状态',
    'statusAB': '状态',
    'activatedCount': '激活次数',
    'activatedCountAB': '激活次数',
    'confirmed': '是否确认',
    'toTask': '转任务',
    'toStory': '转需求',
    'mailto': '抄送给',
    'openedBy': '由谁创建',
    'openedByAB': '创建',
    'openedDate': '创建日期',
    'openedDateAB': '创建日期',
    'openedBuild': '轮数',
    'assignedTo': '指派给',
    'assignedDate': '指派日期',
    'resolvedBy': '解决者',
    'resolvedByAB': '解决',
    'resolution': '解决方案',
    'resolutionAB': '方案',
    'resolvedBuild': '解决版本',
    'resolvedDate': '解决日期',
    'resolvedDateAB': '解决日期',
    'closedBy': '由谁关闭',
    'closedDate': '关闭日期',
    'duplicateBug': '重复ID',
    'lastEditedBy': '最后修改者',
    'lastEditedDate': '最后修改日期',
    'linkBug': '相关Bug',
    'case': '相关OA',
    'files': '附件',
    'keywords': '关键词',
    'lastEditedByAB': '修改者',
    'lastEditedDateAB': '修改日期',
    'fromCase': '来源OA',
    'toCase': '生成OA',
  };
  this.searchOperators = {
    '=': '=',
    '!=': '!=',
    '>': '>',
    '>=': '>=',
    '<': '<',
    '<=': '<=',
    'include': '包含',
    // 'between': '介于',
    'notinclude': '不包含',
    'belong': '从属于',
  };
  this.searchAndor = {
    'and': '并且',
    'or': '或者'
  };
  this.searchFields = {
    'title': this.bugFiled.title,
    'id': this.bugFiled.id,
    'keywords': this.bugFiled.keywords,
    'steps': this.bugFiled.steps,
    'assignedTo': this.bugFiled.assignedTo,
    'resolvedBy': this.bugFiled.resolvedBy,
    'status': this.bugFiled.status,
    'confirmed': this.bugFiled.confirmed,
    'product': this.bugFiled.product,
    'plan': this.bugFiled.plan,
    'platform': this.bugFiled.platform,
    'lostTest': this.bugFiled.lostTest,
    'discoveryPhase': this.bugFiled.discoveryPhase,
    'linkedProduct': this.bugFiled.linkedProduct,
    'case': this.bugFiled.case,
    'linkBug': this.bugFiled.linkBug,
    'module': this.bugFiled.module,
    'project': this.bugFiled.project,
    'severity': this.bugFiled.severity,
    'pri': this.bugFiled.pri,
    'type': this.bugFiled.type,
    'os': this.bugFiled.os,
    'browser': this.bugFiled.browser,
    'resolution': this.bugFiled.resolution,
    'activatedCount': this.bugFiled.activatedCount,
    'toTask': this.bugFiled.toTask,
    'toStory': this.bugFiled.toStory,
    'openedBy': this.bugFiled.openedBy,
    'closedBy': this.bugFiled.closedBy,
    'lastEditedBy': this.bugFiled.lastEditedBy,
    'mailto': this.bugFiled.mailto,
    'openedBuild': this.bugFiled.openedBuild,
    'resolvedBuild': this.bugFiled.resolvedBuild,
    'openedDate': this.bugFiled.openedDate,
    'assignedDate': this.bugFiled.assignedDate,
    'resolvedDate': this.bugFiled.resolvedDate,
    'closedDate': this.bugFiled.closedDate,
    'lastEditedDate': this.bugFiled.lastEditedDate,
  };

  this.searchGroupItems = 3;
  this.searchParams = {
    'id': {
      'operator': '=',
      'control': 'input',
      'values': ''
    },
    'title': {
      'operator': 'include',
      'control': 'input',
      'values': ''
    },
    'keywords': {
      'operator': 'include',
      'control': 'input',
      'values': ''
    },
    'steps': {
      'operator': 'include',
      'control': 'input',
      'values': ''
    },
    'assignedTo': {
      'operator': '=',
      'control': 'select',
      'values': 'users'
    },
    'resolvedBy': {
      'operator': '=',
      'control': 'select',
      'values': 'users'
    },
    'status': {
      'operator': '=',
      'control': 'select',
      'values': this.statusList
    },
    'confirmed': {
      'operator': '=',
      'control': 'select',
      'values': this.confirmedList
    },
    'product': {
      'operator': '=',
      'control': 'select',
      'values': ''
    },
    'plan': {
      'operator': '=',
      'control': 'select',
      'values': ''
    },
    'module': {
      'operator': 'belong',
      'control': 'select',
      'values': 'modules'
    },
    'project': {
      'operator': '=',
      'control': 'select',
      'values': 'projects'
    },
    'severity': {
      'operator': '=',
      'control': 'select',
      'values': this.severityList
    },
    'pri': {
      'operator': '=',
      'control': 'select',
      'values': this.priList
    },
    'type': {
      'operator': '=',
      'control': 'select',
      'values': this.typeList
    },
    'os': {
      'operator': '=',
      'control': 'select',
      'values': this.osList
    },
    'browser': {
      'operator': '=',
      'control': 'select',
      'values': this.browserList
    },
    'resolution': {
      'operator': '=',
      'control': 'select',
      'values': this.resolutionList
    },
    'activatedCount': {
      'operator': '>=',
      'control': 'input',
      'values': ''
    },
    'toTask': {
      'operator': '=',
      'control': 'input',
      'values': ''
    },
    'toStory': {
      'operator': '=',
      'control': 'input',
      'values': ''
    },
    'openedBy': {
      'operator': '=',
      'control': 'select',
      'values': 'users'
    },
    'closedBy': {
      'operator': '=',
      'control': 'select',
      'values': 'users'
    },
    'lastEditedBy': {
      'operator': '=',
      'control': 'select',
      'values': 'users'
    },
    'mailto': {
      'operator': '=',
      'control': 'select',
      'values': 'users'
    },

    'openedBuild': {
      'operator': 'include',
      'control': 'select',
      'values': 'builds'
    },
    'resolvedBuild': {
      'operator': 'include',
      'control': 'select',
      'values': 'builds'
    },

    'openedDate': {
      'operator': '>=',
      'control': 'datetime',
      'values': ''
    },
    'assignedDate': {
      'operator': '>=',
      'control': 'datetime',
      'values': ''
    },
    'resolvedDate': {
      'operator': '>=',
      'control': 'datetime',
      'values': ''
    },
    'closedDate': {
      'operator': '>=',
      'control': 'datetime',
      'values': ''
    },
    'lastEditedDate': {
      'operator': '>=',
      'control': 'datetime',
      'values': ''
    },
  };
};

export default new BUG_LANG();