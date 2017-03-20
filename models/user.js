var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var UserSchema = new Schema({

    _id: {
        type: String
    },
    nick_name: {
        type: String,
        'default': ''
    },
    nick_name_full: {
        type: String,
        'default': ''
    },
    nick_name_short: {
        type: String,
        'default': ''
    },
    user_id: {
        type: String
    },
    user_name: {
        type: String,
        'default': ''
    },
    org_exinfo: {
        type: Schema.Types.Mixed,
        'default': {}
    },
    realm_exinfo: {
        type: Schema.Types.Mixed,
        'default': {}
    },
    lastLoginDate: {
        type: Date,
        'default': Date.now
    }, // 最后登录日期
    lastLoginIp: {
        type: String,
        'default': ''
    }, // 最后登录IP
    loginCount: {
        type: Number,
        'default': 0
    }, // 总登录次数
    createDate: {
        type: Date,
        'default': Date.now
    }, // 建档日期
    config: {
        fixedColumnsLeft: Number,
        unVisibleCol: [String],
        customColHeaders: [String],
        unVisibleColNew: [String],
        customColHeadersNew: [String]
    },
    personInfo: {
        type: Schema.Types.Mixed,
        'default': {}
    }
});

module.exports = UserSchema;