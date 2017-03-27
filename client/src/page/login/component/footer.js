// React Component
import React,{ Component,PropTypes } from 'react'


export default class LoginFooterComponent extends Component {

  render() {
  	let {prefixCls} = this.props,
  		text = 'Copyright © 2017 The Project by 天津晟新宇商贸有限公司. All Rights Reserved'
    return (
      <footer className={`${prefixCls}-footer`}>
          <div>
          <p className={`${prefixCls}-footer-p`}> {text}</p>
        </div>
      </footer>
    )
  }
}
