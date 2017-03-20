import Routes from '../framework/Routes';
import PubSubMsg from '../framework/common/pubsubmsg';
import Storage from '../framework/common/storage';
import React from 'react';
import ReactDOM from 'react-dom';
//防止清除数据之后 render client.html时候没有处罚RoutesCfg.js里的方法
const top_project_hash = 'hash_'+_USERINFO.userId;
if(Storage.local.get(top_project_hash)){

}else{
	Storage.local.set(top_project_hash,window.location.origin + '/client#/case');
}
ReactDOM.render(<Routes />, document.getElementById('framework'));
// PubSubMsg.subscribe('renderRouter', function (resData) {
//     ReactDOM.render(<Routes {...resData} />, document.getElementById('framework'));
// });