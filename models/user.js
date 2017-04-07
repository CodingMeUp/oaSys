var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var UserSchema = new Schema({

    user_id: {
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
    createDate: {
        type: Date,
        'default': Date.now
    }, // 建档日期
    config: {
    },
    personInfo: {
        type: Schema.Types.Mixed,
        'default': {}
    }
});

module.exports = UserSchema;
