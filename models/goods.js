var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var     GoodsSchema = new Schema({

    goods_id: {
        type: String
    },
    goods_name: {
        type: String,
        'default': ''
    },
      goods_spec: {
        type: String,
        'default': ''
    },
      goods_unit: {
        type: String,
        'default': ''
    },
         goods_desc: {
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

module.exports =    GoodsSchema;
