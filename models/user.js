var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var UserSchema = new Schema({

    _id: {
        type: String
    },
    user_name: {
        type: String,
        'default': ''
    },
        password: {
        type: String,
        'default': ''
    },
    user_name_full: {
        type: String,
        'default': ''
    },
    user_name_short: {
        type: String,
        'default': ''
    },
    user_id: {
        type: String
    },
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