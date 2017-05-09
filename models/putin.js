var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var PutinSchema = new Schema({

    putin_goods_name: {  // 主键 可以重复
        type: String,
        'default': ''
    },
    putin_goods_id: {  // 主键 可以重复
        type: String,
        'default': ''
    },
   putin_goods_spec: {// 不修改 回填用
        type: String,
        'default': ''
    },
   putin_goods_unit: {  // 不修改 回填用
        type: String,
        'default': ''
    },
   putin_num: {   // 数量
        type: Number,
        'default': ''
    },
   putin_price: {  //单价
        type: Number,
        'default': ''
    },
   putin_desc: {  // 描述
        type: String,
        'default': ''
    },
    putin_house_id: {  //  仓库
        type: String,
        'default': ''
    },
    putin_house_name: {  //  仓库
        type: String,
        'default': ''
    },
       putin_apply_id: {  // 供应商
        type: String,
        'default': ''
    },
    putin_apply_name: {  // 供应商
        type: String,
        'default': ''
    },
    putin_connect_id: {  //  对接人
        type: String,
        'default': ''
    },
    putin_connect_name: {  //  对接人
        type: String,
        'default': ''
    },
    putin_person_id: {  //  操作人
        type: String,
        'default': ''
    },
    putin_person_name: {  //  操作人
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

module.exports = PutinSchema;
