import React from 'react';
import { message } from 'antd';
import CryptoJS from 'crypto-js';
export default {

	/**加密串与顶层项目常量--- */
	secret: 'caseMng.1234',
	top_current_project: 'TOP_CURRENT_PROJECT',
	/**AES加密与解密--- */
	encrypt: function encrypt(value, secret) {
		return CryptoJS.AES.encrypt(value, secret).toString();
	},
	decrypt: function decrypt(encryptObj, secret) {
		return CryptoJS.AES.decrypt(encryptObj, secret).toString(CryptoJS.enc.Utf8);
	},
	
	/**
	*@params tyep:消息类型;text:消息文本;time:显示时长;top:消息距离顶部的位置
	*/
	message: function (type, text, time, top) {
		message.destroy();
		message.config({
			top: top ? top : 24
		});
		if (!time) {
			time = 1.5;
		};
		if (type == "success") {
			message.success(text, time);
		} else if (type == "error") {
			message.error(text, time);
		} else if (type == "info") {
			message.info(text, time);
		} else if (type == "loading") {
			message.loading(text, time);
		}
	}
}