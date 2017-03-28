import { createAction } from 'redux-actions';
import _ from 'lodash';
import * as types from '../constant/actiontype';
import API from '../page/API';
import Ajax from '../framework/common/ajax';


export function clearErrors() {
  return (dispatch, getState) => {
    dispatch({
      type: types.CLEAR_ERRORS,
      error: null
    });
  };
}

/**
 * 登录用户
 */
export function userLogin(postData) {
  return (dispatch, getState) => {
    Ajax.post({
      url: API.USER_LOGIN,
      data: postData,
      success(res) {
        const result = res.body;
        if (result.status === 200) {
          let state = {
            type: types.USER_LOGIN,
            username: result.data.username,
            message:result.message
          };
          dispatch(state);
        } else {
          dispatch({
            type: types.FETCH_ERRORS,
            username: result.data.username,
            error: result.message
          });
        }
      }
    })
  };
}
