import { createAction } from 'redux-actions';
import _ from 'lodash';
import * as types from '../constant/actiontype';
import API from '../page/API';
import Ajax from '../framework/common/ajax';

/**
 * 获取 BUG 详情
 */
export function getBugById(bugId, isEdit) {
  return (dispatch, getState) => {
    let option = { bugId: bugId };
    if (isEdit) {
      option.isEdit = 1;
    }
    Ajax.get({
      url: API.BUG_INFO_BY_ID,
      data: option,
      before: function () {
        dispatch({
          type: types.PAGE_LOADING,
          pageLoading: true,
          bug: {},
          users: [],
          files: [],
          actions: []
        });
      },
      success(res) {
        const result = res.body;

        if (result.status === 200) {
          let state = {
            type: types.FETCH_BUG_BY_ID,
            bug: result.data.bug,
            users: result.data.users,
            files: result.data.files,
            actions: result.data.actions,
            pageLoading: false
          };
          if (isEdit) {
            state.projectList = result.data.projectList;
            state.builds = result.data.builds;
            state.modules = result.data.modules;
            state.storys = result.data.storys;
            state.taskList = result.data.taskList;
            state.productList = result.data.productList;
          }
          dispatch(state);
        } else {
          dispatch({
            type: types.FETCH_BUG_ERROR,
            pageLoading: false,
            error: result.message
          });
        }
      }
    })
  };
}


/**
 * 获取 BUG list
 */
export function getBugList(searchOption = {}) {
  return (dispatch, getState) => {
    Ajax.get({
      url: API.BUG_LIST,
      data: searchOption,
      before: function () {
        dispatch({
          type: types.TABLE_LOADING,
          tableLoading: true,
          error: null
        });
      },
      success(res) {
        const result = res.body;

        if (result.status === 200) {
          let state = {
            type: types.FETCH_BUG_LIST,
            bugs: result.data.bugs,
            modules: result.data.modules,
            projects: result.data.projects,
            tableLoading: false,
            pagination: {
              pageSize: searchOption.limit ? searchOption.limit : 20,
              total: result.data.bugsCount
            }
          };
          if (!searchOption.isShowModules) {
            delete state.modules;
          }
          if (!searchOption.isFirst) {
            delete state.projects;
          }
          dispatch(state);
        } else {
          dispatch({
            type: types.FETCH_BUG_ERROR,
            tableLoading: false,
            error: result.message
          });
        }
      }
    })
  };
}

/**
 * 获取 BUG 创建 的数据
 */
export function getBugCreateData(productId, isProductChange = false, projectId = null, bugId = null) {
  return (dispatch, getState) => {
    let option = {
      productId: productId
    };
    if (bugId) {
      option.bugId = bugId;
    }
    if (isProductChange) {
      option.isProductChange = 1;
    }
    if (projectId) {
      option = {
        projectId: projectId
      };
    }

    Ajax.get({
      url: API.BUG_CREATE_DATA,
      data: option,
      before: function () {
        dispatch({
          type: types.PAGE_LOADING,
          pageLoading: true,
          createBugInfo: {}
        });
      },
      success(res) {
        const result = res.body;

        if (result.status === 200) {
          let state;
          if (projectId) {
            state = {
              type: types.FETCH_BUG_CREATE_DATA,
              pageLoading: false,
              taskList: result.data.taskList
            };
          } else {
            state = {
              type: types.FETCH_BUG_CREATE_DATA,
              pageLoading: false,
              projectList: result.data.projectList,
              builds: result.data.builds,
              modules: result.data.modules,
              storys: result.data.storys
            };
            if (bugId) {
              state.bug = result.data.bug;
            }
            if (!isProductChange) {
              state.productList = result.data.productList;
              state.users = result.data.users;
            }
          }

          dispatch(state);
        } else {
          dispatch({
            type: types.FETCH_BUG_ERROR,
            pageLoading: false,
            error: result.message
          });

        }
      }
    })
  };
}




/**
 * 创建 BUG
 */
export function createBug(postData) {
  return (dispatch, getState) => {
    Ajax.post({
      url: API.BUG_CREATE,
      data: postData,
      before: function () {
        dispatch({
          type: types.PAGE_LOADING,
          pageLoading: true
        });
      },
      success(res) {
        const result = res.body;

        if (result.status === 200) {
          let state = {
            type: types.FETCH_BUG_CREATE,
            pageLoading: false,
            createBugInfo: result.data
          };
          dispatch(state);
        } else {
          dispatch({
            type: types.FETCH_BUG_ERROR,
            pageLoading: false,
            error: result.message
          });
        }
      }
    })
  };
}


/**
 * 编辑 BUG
 */
export function updateBug(postData) {
  return (dispatch, getState) => {
    Ajax.post({
      url: API.BUG_UPDATE,
      data: postData,
      before: function () {
        dispatch({
          type: types.PAGE_LOADING,
          pageLoading: true
        });
      },
      success(res) {
        const result = res.body;

        if (result.status === 200) {
          let state = {
            type: types.FETCH_BUG_UPDATE,
            pageLoading: false,
            updateBugInfo: result.data
          };
          dispatch(state);
        } else {
          dispatch({
            type: types.FETCH_BUG_ERROR,
            pageLoading: false,
            error: result.message
          });
        }
      }
    })
  };
}

/**
 * 获取 项目列表
 */
export function getProjectList() {
  return (dispatch, getState) => {
    Ajax.get({
      url: API.BUG_PROJECT_LIST,
      success(res) {
        const result = res.body;

        if (result.status === 200) {
          let state = {
            type: types.FETCH_BUG_PROJECT_LIST,
            projects: result.data
          };
          dispatch(state);
        } else {
          dispatch({
            type: types.FETCH_BUG_ERROR,
            error: result.message
          });
        }
      }
    })
  };
}


export function clearBugCreateUpdateInfo() {
  return (dispatch, getState) => {
    dispatch({
      type: types.CLEAR_CREATE_UPDATE_INFO,
      createBugInfo: null,
      updateBugInfo: null
    });
  };
}

export function clearErrors() {
  return (dispatch, getState) => {
    dispatch({
      type: types.CLEAR_ERRORS,
      error: null
    });
  };
}

export function doBugViewModalVisible(type, visible) {
	return (dispatch, getState) => {
    var visable = {};
    visable[type] = visible ? true : false;

    dispatch({
      type: types.DO_BUG_VIEW_MODAL_VISIBLE,
      modalVisable: visable
    });
  };
}

/**
 * 显示隐藏 BUG 列表边栏
 */
export function showOrHideSidebar(state) {
  return (dispatch, getState) => {
    dispatch({
      type: types.SHOW_OR_HIDE_SIDEBAR,
      sideBarIsDisplay: state
    });
  };
}

/**
 * 显示隐藏 BUG 搜索栏
 */
export function showOrHideSearchbar(state, loadingData) {
  return (dispatch, getState) => {
    dispatch({
      type: types.SHOW_OR_HIDE_SEARCH_BAR,
      searchBarIsDisplay: state,
      searchBarSpinning: false
    });
  };
}