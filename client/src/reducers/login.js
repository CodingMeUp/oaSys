import * as types from '../constant/actiontype';
import _ from 'lodash';

let initialState = {
	username: '',
	isCorrect: false,
	message: ''
};


export default function (state = initialState, action = {}) {
	switch (action.type) {
		case types.USER_LOGIN:
			return _.assign({}, state, action);
		default:
			return state;
	}
}
