import React,{ Component,PropTypes } from 'react'
import { Tabs,Icon } from 'antd';

const TabPane = Tabs.TabPane;

export default class PortalMainComponent extends Component {
	handleEdit(targetKey, action){
		if(!targetKey || !action) return
		if(action === "remove")
			this.props.delTab(targetKey)

	}

	handleChange(activeKey){
		if(!activeKey) return
		this.props.selectTab(activeKey)
	}

	getTabPanes(tabs){
		return tabs.map((tab,index)=>{
			return (
				<TabPane key={tab.get('url')} tab={tab.get('title')}>
					{this.getPaneContent(tab)}
				</TabPane>
			)
		})
	}

	getPaneContent(tab){
		let url = tab.get('url')
		if(!url)
			return <div></div>

		if(url.indexOf('http://') !== -1){
			return(
				<iframe className="iframe" src={url} />
			)
		}

		if(url.indexOf('iframe://') !== -1){
			return(
				<iframe className="iframe" src={url.replace('iframe://','')} />
			)
		}

	}

  	render(){
  		let {prefixCls, payload} = this.props,
  			getter = payload.getIn(['utils','getter']),
			tabs = getter('portal.tabs', 'value'),
			currentTab = getter('portal.currentTab', 'value'),
			activeKey = currentTab?currentTab.get('url'):undefined,
  			tabPanes = this.getTabPanes(tabs)

  		return (
  			<div className={`${prefixCls}-main`}>
  				 <Tabs type='editable-card'
  				 	onEdit={this.handleEdit}
  				 	activeKey={activeKey}
  				 	onChange={this.handleChange}>
  				 	{tabPanes}
  				 </Tabs>
  			</div>
  		)
  	}
}
