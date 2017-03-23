import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import * as reducers from './index';
import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';

const reducer = combineReducers(
	reducers
);

const logger = createLogger();
const createStoreWithMiddleware = applyMiddleware(
	thunkMiddleware,
  // logger
)(createStore);

export default function configureStore(initialState) {
  return createStoreWithMiddleware(reducer, initialState);
}
