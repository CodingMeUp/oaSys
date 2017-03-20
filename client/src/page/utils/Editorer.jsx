import React from 'react';
import _ from 'lodash';
import API from '../API';
import $ from 'jquery';

export default React.createClass({
    // 编辑器样式
    style: {
        width: '100%',
        height: '300px'
    },

    bugTools: ['formatblock', 'fontname', 'fontsize', '|', 'forecolor', 'hilitecolor', 'bold', 'italic', 'underline', '|',
        'justifyleft', 'justifycenter', 'justifyright', 'insertorderedlist', 'insertunorderedlist', '|',
        'image', 'code', 'link', '|', 'removeformat', 'undo', 'redo', 'fullscreen', 'source', 'about'],

    render: function () {
        return (
            <div>
                <textarea id={this.props.editorId} name="content" style={this.style}>
                </textarea>
            </div>
        );
    },
    componentDidUpdate: function (prevProps) {
        const tf = _.isEqual(this.props.editorHtml, prevProps.editorHtml);
        if (!tf) {
            window[this.props.editorName].html(this.props.editorHtml);
        }
    },
    componentDidMount: function () {
        const _this = this;
        window[_this.props.editorName] = window.KindEditor.create('#' + _this.props.editorId, {
            items: _this.bugTools,
            filterMode: true,
            resizeMode: 1,
            wellFormatMode: false,
            uploadJson: API.BUG_UPLOAD_FILE + '?isEditor=1',
            afterCreate: function () {
                var doc = this.edit.doc;
                var cmd = this.edit.cmd;
                if (!window.KindEditor.WEBKIT && !window.KindEditor.GECKO) {
                    var pasted = false;
                    $(doc.body).bind('paste', function (ev) {
                        pasted = true;
                        return true;
                    });
                    setTimeout(function () {
                        $(doc.body).bind('keyup', function (ev) {
                            if (pasted) {
                                pasted = false;
                                return true;
                            }
                            if (ev.keyCode == 86 && ev.ctrlKey) alert('您的浏览器不支持粘贴图片！');
                        })
                    }, 10);
                }
                /* Paste in chrome.*/
                /* Code reference from http://www.foliotek.com/devblog/copy-images-from-clipboard-in-javascript/. */
                if (window.KindEditor.WEBKIT) {
                    $(doc.body).bind('paste', function (ev) {
                        var $this = $(this);
                        var original = ev.originalEvent;
                        var file = original.clipboardData.items[0].getAsFile();
                        if (file) {
                            var reader = new FileReader();
                            reader.onload = function (evt) { 
                                var result = evt.target.result;
                                var arr = result.split(",");
                                var data = arr[1]; // raw base64
                                var contentType = arr[0].split(";")[0].split(":")[1];

                                // cmd.inserthtml('<img src="' + result + '" alt="" />');     
                                // console.log(result);
                                // html = '<img src="' + result + '" alt="" />';
                                $.post(API.BUG_UPLOAD_BASE64_IMG, { data: result }, function (data) { 
                                    // console.log(data);
                                    if (data && data.status === 200) {
                                        cmd.inserthtml('<img src="' + data.data.imgPath + '" alt="" />');     
                                    }
                                });
                            };
                            reader.readAsDataURL(file);
                        }
                    });
                }
                /* Paste in firfox and other firfox.*/
                else {
                    window.KindEditor(doc.body).bind('paste', function (ev) {
                        setTimeout(function () {
                            var html = window.KindEditor(doc.body).html();
                            console.log(html);
                        }, 80);
                    });
                }
                /* End */
            },
        });

        if (_this.props.editorHtml) {
            window[_this.props.editorName].html(_this.props.editorHtml);
        }
    },
    componentWillUnmount: function () {
        window[this.props.editorName].remove();
    }
});
