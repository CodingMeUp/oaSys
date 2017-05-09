var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var PutoutSchema = new Schema({

    putout_goods_name: {  // 主键 可以重复
        type: String,
        'default': ''
    },
    putout_goods_id: {  // 主键 可以重复
        type: String,
        'default': ''
    },
   putout_goods_spec: {// 不修改 回填用
        type: String,
        'default': ''
    },
   putout_goods_unit: {  // 不修改 回填用
        type: String,
        'default': ''
    },
   putout_num: {   // 数量
        type: Number,
        'default': ''
    },
   putout_price: {  //单价
        type: Number,
        'default': ''
    },
   putout_desc: {  // 描述
        type: String,
        'default': ''
    },
    putout_house_id: {  //  仓库
        type: String,
        'default': ''
    },
    putout_house_name: {  //  仓库
        type: String,
        'default': ''
    },
       putout_customer_id: {  //客户
        type: String,
        'default': ''
    },
    putout_customer_name: {  //客户
        type: String,
        'default': ''
    },
    putout_connect_id: {  //  对接人
        type: String,
        'default': ''
    },
    putout_connect_name: {  //  对接人
        type: String,
        'default': ''
    },
    putout_person_id: {  //  操作人
        type: String,
        'default': ''
    },
    putout_person_name: {  //  操作人
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

module.exports = PutoutSchema;
