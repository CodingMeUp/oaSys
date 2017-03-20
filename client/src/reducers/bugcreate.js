import * as types from '../constant/actiontype';
import _ from 'lodash';

let initialState = {
	pageLoading: true,
	productList: [],
	projectList: [],
	builds: {},
	users: [],
	modules: [],
	storys: [],
	taskList: [],
	createBugInfo: {},
	bug: {}
};


export default function (state = initialState, action = {}) {
	switch (action.type) {
		case types.FETCH_BUG_CREATE_DATA:
			return _.assign({}, state, action);
		case types.FETCH_BUG_CREATE:
		  return _.assign({}, state, action);
		case types.PAGE_LOADING:
			return _.assign({}, state, action);
		case types.FETCH_BUG_ERROR:
			return _.assign({}, state, action);
		case types.CLEAR_ERRORS:
			return _.assign({}, state, action);
		case types.CLEAR_CREATE_UPDATE_INFO:
			return _.assign({}, state, action);
		default:
			return state;
	}
}