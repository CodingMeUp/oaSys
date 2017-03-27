import React,{ Component,PropTypes } from 'react'
import Header from './component/header'
import Footer from './component/footer'
// import Left from './component/left'
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
	    return (
	    	<div className={this.props.prefixCls}>
	 			<Header  {...this.props}/>
	      <Container  {...this.props}/>
      	<Footer  {...this.props}/>
	     	</div>
	    )
	 }
}
