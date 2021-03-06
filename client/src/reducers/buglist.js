import * as types from '../constant/actiontype';
import _ from 'lodash';

let initialState = {
	tableLoading: false,
	bugs: [],
};


export default function (state = initialState, action = {}) {
	switch (action.type) {
		case types.FETCH_BUG_BY_ID:
			return _.assign({}, state, action);
		default:
			return state;
	}
}
