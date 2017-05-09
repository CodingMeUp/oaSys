var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var RemainSchema = new Schema({
     goods_id: {
        type: String,
        'default': ''
    },
    goods_name: {
        type: String,
        'default': ''
    },
    total: {  // 总额
        type: String,
        'default': ''
    },
    count: {  // 总数
        type: String,
        'default': ''
    },
   goods_spec: {//
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

module.exports = RemainSchema;
