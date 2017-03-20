import * as types from '../constant/actiontype';
import _ from 'lodash';

let initialState = {
	pageLoading: true,
	bug: {},
	files: [],
	actions: [],
	modalVisable: {}
};


export default function (state = initialState, action = {}) {
	switch (action.type) {
		case types.FETCH_BUG_BY_ID:
			return _.assign({}, state, action);
		case types.PAGE_LOADING:
			return _.assign({}, state, action);
		case types.FETCH_BUG_ERROR:
			return _.assign({}, state, action);
		case types.DO_BUG_VIEW_MODAL_VISIBLE:
			return _.assign({}, state, action);
		default:
			return state;
	}
}