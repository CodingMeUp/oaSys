import * as types from '../constant/actiontype';
import _ from 'lodash';

let initialState = {
	tableLoading: false,
	bugs: [],
	modules: [],
	projects: [],
	selectedRowKeys: [],
	pagination: {},
	sideBarIsDisplay: undefined,
	searchBarIsDisplay: false,
	searchBarSpinning: true,

	users: [],
	actions: [],
	productList: [],
	projectList: [],
	builds: {}
};


export default function (state = initialState, action = {}) {
	switch (action.type) {
		case types.FETCH_BUG_BY_ID:
			return _.assign({}, state, action);
		case types.FETCH_BUG_LIST:
			return _.assign({}, state, action);
		case types.FETCH_BUG_PROJECT_LIST:
			return _.assign({}, state, action);
		case types.TABLE_LOADING:
			return _.assign({}, state, action);
		case types.FETCH_BUG_ERROR:
			return _.assign({}, state, action);
		case types.SHOW_OR_HIDE_SIDEBAR:
			return _.assign({}, state, action);
		case types.SHOW_OR_HIDE_SEARCH_BAR:
			return _.assign({}, state, action);
		default:
			return state;
	}
}