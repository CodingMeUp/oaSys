// React Component
import React,{ Component,PropTypes } from 'react'
import { Input,Tabs, Button, Icon,Form} from 'antd'
const FormItem = Form.Item;
const TabPane = Tabs.TabPane

export default class LoginMainComponent extends Component {
	handleLoginClick(e){
		this.props.login((result)=>{
			if(result.result)
      			this.props.onLoginSuccess()
		})
	}

  	render() {
  		let {prefixCls, ...props} = this.props
			console.log(1)
    	return (
    	   <div className={`${prefixCls}-main`}>
    	   	<div className={`${prefixCls}-main-form`}>
	           <Tabs className={`${prefixCls}-main-tabs`}>
	        		<TabPane tab="登录" key="1">
	        			<div className={`${prefixCls}-main-tabs-form`}>
	        				<FormItem >
	        					<Input addonBefore="用户"  />
	        				</FormItem>
		        			<FormItem  >
		          				<Input  addonBefore="密码"   />
		          			</FormItem>
		          			<Button type="primary" className={`${prefixCls}-main-tabs-form-btn`} onClick={this.handleLoginClick}>登录</Button>
	          			</div>
	        		</TabPane>

	      		</Tabs>
      		</div>
      		</div>
    	)
  	}
}
