export default {
  CASE_JSON: '/manage/case.json',
  CSAE_JSONDATA: '/client/case/caseJsonData',    //编辑项目OR模块下的用例数据
  CASE_EXCELJSON: '/client/case/excelJson', //获取项目OR模块下的用例数据
  CASE_ROWHISTORY: '/client/case/rowHistory',
  CASE_USERCONFIG: '/client/case/userConfig',
  CASE_CONFIG: '/client/case/config',
  REPORT_PROJECT_CASE: '/client/report/projectCaseData',
  // CASE_DO_SAVE_ALLOCATION: '/client/casedo/saveAllocation', ProjectCaseSelect使用 废弃 12.8 cyn
  CASE_DO_TODO_LIST: '/client/casedo/todolist',
  CASE_DO_UPDATE_RESULT: '/client/casedo/updateResult',
  CASE_DO_VERSION_LIST: '/client/casedo/versionlistByModule',  //按模块ID 获取该模块下的用例所有版本和轮数信息
  CASE_DO_INFO_BY_ID: '/client/casedo/infoById',  //按执行用例ID 获取该id下的执行用例信息
  CASE_DO_CANCEL: '/client/casedo/cancel', //取消执行任务
  CASE_DO_DELETE: '/client/casedo/delete', //删除执行任务
  CASE_DO_EDIT_SAVE: '/client/casedo/saveEdit', //保存用例执行任务 更改
  CASE_DO_SAVE_ALLOCATION_BY_VERSION: '/client/casedo/saveAllocationByVersion', //保存用例执行任务  按版本轮数形式
  CASE_DO_RESULT: '/client/casedo/caseDoResult', // 获取用例执行结果
  CASE_DO_SAVE_BY_MULIT_MODULE: '/client/casedo/saveByMulitModule', // 按模块 设置关联用户的方式批量保存用例执行任务
  CASE_DO_RESULT_DETAIL: '/client/casedo/caseDoResultDetail', // 用例执行结果详细信息查询
  CASE_DO_RESULT_HISTORY_BY_ID: '/client/casedo/caseDoResultHistoryById', // 用例执行结果历史记录查询， 按用例ID
  CASE_DO_IS_OLDPROJECT:'/client/casedo/isOldProject',//判断配置后的产品是否有历史执行数据

  USER_ALL_LIST: '/client/user/all',
  USER_ROLE: '/client/user/userRole',
  USER_AUTH_MODIFY: '/client/user/userAuthModify',

  UPLOAD_EXCEL: '/client/upload/excel', //上传excel用例
  UPLOAD_EXCEL_IMPORT: '/client/upload/excelImport', // 保存excel用例
  UPLOAD_XMIND: '/client/upload/xmind',
  EXPORT_EXCEL: '/manage/export/exportExcel', //导出用例Excel

  SYSTEM_VERSION: '/client/version',
  SYSTEM_VERSIONLOOK: '/client/versionLook',

  PRODUCT_PROJECT_TREESELECT:'/loadProductProject',
  PRODUCT_PROJECT_TREESELECT_MANAGE:'/ProductProjectOfManage',

  PROJECT_CONFIG_ADD: '/client/project/projectConfigAdd',//功能配置
  PROJECT_CONFIG:'/client/project/projectConfig',
  PROJECT_MANAGE: '/client/project/list',
  PROJECT_MODULE_MANAGE:'/client/project/modulelist',//模块管理列表
  PROJECT_AUTH:'/client/project/authList',
  ZT_MODULE_BY_ZT_PRODUCT:'/client/project/authZtModuleList',//根据产品获取产品下的模块
  PROJECT_AUTH_DELETE: '/client/project/authDelete',
  PROJECT_AUTH_ADD: '/client/project/authAdd',
  PRO_USER_ROLE_MODIFY:'/client/project/authModify',
  PMS_PROJECT_LIST: '/client/project/pmsList',
  PMS_PROJECT_SYN:'/client/project/pmsSyn',
  PMS_PROJECT_SYNINFO:'/client/project/pmsSynInfo',
  PROJECT_POST: '/client/project/post',
  PROJECT_DELETE: '/client/project/delete',
  PROJECT_PUT: '/client/project/put',
  PROJECT_MODULE_POST: '/client/project/modulePost',
  PROJECT_MODULEMOVE_GET: '/client/project/moduleMoveGet',//模块拖拽修改
  PROJECT_MODULPASTE_PUT: '/client/project/modulePaste',//模块复制
  PROJECT_MODULE_PUT: '/client/project/modulePut',
  MAX_SORT: '/client/project/maxSort',
  PROJECT_VERSION_TREE: '/client/project/projectVersionTree',
  PROJECT_HISTORY_VERSION_TREE: '/client/project/projectHistoryVersionTree',//获取配置后产品旧项目下的版本数据
  PROJECT_VERSION_SAVE: '/client/project/projectVersionSave',
  PROJECT_VERSION_MODULE: '/client/project/projectVersionModule', // 按项目ID 获取项目下的所有模块
  PROJECT_VERSION_MODULE_CASE: '/client/project/projectVersionModuleCase', // 获取模块下 的 所有用例
  PROJECT_INFO_BY_ID: '/client/project/projectInfoById',
  PROJECT_VERSION_DELETE: '/client/project/projectVersionDelete', // 删除 版本/轮数信息
  PROJECT_VERSION_MENUGETDATA: '/client/project/projectVersionGetData', //countBytimes回填

  MODULE_TREE: '/client/project/tree',
  MODULE_TREE_WITH_CASE_DO_INFO: '/client/project/tree?isShowCaseDoInfo=1',
  MODULE_TREE_WITH_CASE_DO_DOT: '/client/project/tree?isShowCaseDoDot=1',
  MODULE_TREE_WITH_CASE_DO_DOTS: '/client/project/caseDoTree',    //【新】获取用例执行项目模块树
  PROJECT_SYSTEM_VERSION : '/client/project/version',
  PROJECT_SYSTEM_VERSION_LOADENV:'/client/project/versionLoadEnv',


  //PMS产品项目和本地用例项目
  PMS_PRODUCT_LIST: '/client/zentao/getPmsProductList',
  ALL_MODULE_TREE:'/client/zentao/tree',
  PMS_CASEMNG_TRANSFORM:'/client/zentao/makeTransform',
  DELETE_CASEMNG_PROJECT:'/client/zentao/deleteCaseMngProject',
  SET_PRODUCT_AND_MODULE:'/client/zentao/setProductAndModule',
  //bug
  BUG_GET_BY_ID: '/client/bug/getBugInfoById', // 获取 各个平台的BUG 信息BY BUG id
  BUG_LIST: '/client/bug/list',
  BUG_INFO_BY_ID: '/client/bug/getBugById',
  BUG_PROJECT_LIST: '/client/bug/getProjectList',
  BUG_CREATE_DATA: '/client/bug/getCreateBugData',
  BUG_CREATE: '/client/bug/createBug',
  BUG_UPDATE: '/client/bug/updateBug',
  BUG_UPDATE_COMMENT: '/client/bug/updateBugComment',
  BUG_UPDATE_ASSIGNEDTO: '/client/bug/updateBugAssignedTo',
  BUG_UPDATE_ACTIVE: '/client/bug/updateBugActive',
  BUG_UPDATE_CLOSED: '/client/bug/updateBugClosed',
  BUG_UPLOAD_FILE: '/client/bug/uploadFile',
  BUG_UPLOAD_BASE64_IMG: '/client/bug/updateBase64Img',

  //QAM接口
  GET_QAM_TIMES : '/client/qam_api/getTimes',//根据项目ID和版本获取轮数
  GET_QAM_VERSION : '/client/qam_api/getVersion',//根据项目ID获取版本信息
  UPDATE_QAM_TIMES : '/client/qam_api/updateTimes',

  //自测
  MODULE_TREE_WITH_SELFTEST: '/client/selftest/caseDoTree',    //【新】获取用例执行项目模块树
  SELFTEST_UPDATE_RESULT: '/client/selftest/updateResult',
  SELFTEST_TODO_LIST: '/client/selftest/todolist',
  SELFTEST_VERSION_LIST: '/client/selftest/versionlistByModule',  //按模块ID 获取该模块下的用例所有版本和轮数信息
  SELFTEST_RESULT: '/client/selftest/caseDoResult', // 获取用例执行结果
  SELFTEST_SAVE_BY_MULIT_MODULE: '/client/selftest/saveByMulitModule', // 按模块 设置关联用户的方式批量保存用例执行任务
  MODULE_VERSION_SAVE: '/client/selftest/moduleVersionSave',
  SELFTEST_RESULT_HISTORY_BY_ID: '/client/selftest/caseDoResultHistoryById', // 用例执行结果历史记录查询， 按用例ID
  SELFTEST_RESULT_DETAIL: '/client/selftest/caseDoResultDetail', // 用例执行结果详细信息查询

  //报表
  REPORT_DO: '/client/report/projectDo',
  REPORT_ALL_DO: '/client/report/projectAllDo',
  REPORT_ALL_GT3_DO: '/client/report/projectAllDoGT3',  // 轮数大于三
  REPORT_USER_ACTIVE: '/client/report/userActive',  // 项目人员活跃度

  //审核
  AUDIT_MODULE_TREE:'/client/caseAudit/auditModuleTree',//获取审核左侧树
  PROJECT_AUDIT_TREE: '/client/project/projectAuditTree',
  PROJECT_TASK_SAVE: '/client/caseAudit/projectTaskSave',
  PROJECT_TASK_DELETE: '/client/caseAudit/projectTaskDelete', // 删除 任务信息
  PROJECT_TASK_MODULE: '/client/caseAudit/projectTaskModule', // 按项目ID 获取项目下的所有模块 表格换树
  PROJECT_TASK_MODULE_CASE: '/client/caseAudit/projectTaskModuleCase', // 获取模块下 的 所有用例
  AUDIT_SAVE_ALLOCATION_BY_TASK: '/client/caseAudit/saveAllocationByTask', //保存用例审核任务 表格右侧保存
  CASE_TASK_DELETE: '/client/caseAudit/delete', //删除审核执行任务
  CASE_TASK_SAVE_BY_MULIT_MODULE: '/client/caseAudit/saveByMulitModule', // 按模块 设置关联用户的方式批量保存用例执行任务
  CASE_AUDIT_TODO_LIST:'/client/caseAudit/caseAuditTodoList',//获取审核的用例数据
  CASE_AUDIT_IS_BROWSE:'/client/caseAudit/caseAuditIsBrowse',//根据项目id获取审核模式（用例编辑、浏览模式）
  CASEAUDIT_JSONDATA:'/client/caseAudit/caseAuditJsonData',//保存审核的用例
  CASE_ROWAUDITHISTORY:'/client/caseAudit/rowAuditHistory',//展示审核历史
}