import * as types from '../constant/actiontype';
import _ from 'lodash';

let initialState = {
	pageLoading: true,
	bug: {},
	users: [],
	actions: [],
	productList: [],
	projectList: [],
	builds: {},
	modules: [],
	storys: [],
	taskList: [],
	updateBugInfo: {},
};


export default function (state = initialState, action = {}) {
	switch (action.type) {
		case types.FETCH_BUG_BY_ID:
			return _.assign({}, state, action);
		case types.FETCH_BUG_UPDATE:
			return _.assign({}, state, action);
		case types.PAGE_LOADING:
			return _.assign({}, state, action);
		case types.FETCH_BUG_ERROR:
			return _.assign({}, state, action);
		case types.FETCH_BUG_CREATE_DATA:
			return _.assign({}, state, action);
		case types.CLEAR_CREATE_UPDATE_INFO:
			return _.assign({}, state, action);
		case types.CLEAR_ERRORS:
			return _.assign({}, state, action);
		default:
			return state;
	}
}