// React Component
import React,{ Component,PropTypes } from 'react'
import { bindActionCreators } from 'redux';
import { browserHistory, Router, Route, Link } from 'react-router';
import { connect } from 'react-redux';
import * as LoginAction from '../../../actions/login';
import { Input,Tabs, Button, Message, Icon,Form,Checkbox} from 'antd'
const FormItem = Form.Item;
const TabPane = Tabs.TabPane

export  class LoginMainComponent extends Component {
	handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
				const { loginAction} = this.props
				loginAction.userLogin(values);
      }
    });
		console.log(this.props)
		if( login.type === 'USER_LOGIN' && !login.isCorrect ){
			Message.error(login.message)
		}else if (login.type === 'USER_LOGIN' && login.isCorrect ) {
			Message.info(login.message)
			location.href = 'www.baidu.com'
		}
  }
  	render() {

  		let {prefixCls, ...props} = this.props
			const { getFieldDecorator } = this.props.form
    	return (
    	   <div className={`${prefixCls}-main`}>
    	   	<div className={`${prefixCls}-main-form`}>
	           <Tabs className={`${prefixCls}-main-tabs`}>
	        		<TabPane tab="登录" key="1">
								<Form onSubmit={this.handleSubmit} className={`${prefixCls}-form`}>
										 <FormItem wrapperCol={{ span: 20,offset: 2 }}>
											 {getFieldDecorator('username', {
												 rules: [{ required: true, message: '请输入用户名！' }],
											 })(
												 <Input addonBefore='账号' className={`${prefixCls}-form-ipt`}  prefix={<Icon type="user" style={{ fontSize: 13 }} />} placeholder="请输入用户名" />
											 )}
										 </FormItem>
										 <FormItem  wrapperCol={{ span: 20,offset: 2 }}>
											 {getFieldDecorator('password', {
												 rules: [{ required: true, message: '请输入密码！' }],
											 })(
												 <Input  addonBefore='密码' className={`${prefixCls}-form-ipt`}  prefix={<Icon type="lock" style={{ fontSize: 13 }} />} type="password" placeholder="请输入密码" />
											 )}
										 </FormItem>
										 <FormItem>
											 <Button type="primary" htmlType="submit" style={{width: 200}}>
												 		登录
											 </Button>
										 </FormItem>
									 </Form>
	        		</TabPane>
	      		</Tabs>
      		</div>
      		</div>
    	)
  	}
}
const LoginForm = Form.create()(LoginMainComponent);
export default connect((state, props) => ({
			login: state.login
}), dispatch => ({
  loginAction: bindActionCreators(LoginAction, dispatch)
}))(LoginForm);
