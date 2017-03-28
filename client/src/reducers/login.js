import * as types from '../constant/actiontype';
import _ from 'lodash';

let initialState = {
	username: '',
	message: ''
};


export default function (state = initialState, action = {}) {
	switch (action.type) {
		case types.USER_LOGIN:
			return _.assign({}, state, action);
		case types.FETCH_ERRORS:
				return _.assign({}, state, action);
		case types.CLEAR_ERRORS:
				return _.assign({}, state, action);
		default:
			return state;
	}
}
