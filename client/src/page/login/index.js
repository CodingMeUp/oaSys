import React,{ Component,PropTypes } from 'react'
import Header from './component/header'
import Footer from './component/footer'
import Left from './component/left'
import Container from './component/main'
import styles from "./login.less"
import {Modal} from 'antd'

export default class LoginNewComponent extends Component {
	static defaultProps = {
      	prefixCls: 'login'
  	}

  	constructor(props){
  		super(props)
	}

  	componentDidMount() {
  		// this.props.initView()
  	}

  	render() {
  		// if(!this.props.payload || !this.props.payload.get('utils') )
      //      return (<div></div>)
			//
       // 	let message = this.props.payload.getIn(['global', 'message'])
			 let message = '11111'
	    return (
	    	<div className={this.props.prefixCls}>
	 			<Header  {...this.props}/>
	        	<div>
	           		<Left  {...this.props}/>
	           		<Container  {...this.props}/>
	        	</div>
	        	<Footer  {...this.props}/>

	     	</div>
	    )
	 }
}
