var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var OrdersSchema = new Schema({

    orders_id: {
        type: String
    },
    orders_name: {
        type: String,
        'default': ''
    },
      orders_person: {
        type: String,
        'default': ''
    },
      orders_phone: {
        type: String,
        'default': ''
    },
      orders_address: {
        type: String,
        'default': ''
    },
         orders_desc: {
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

module.exports = OrdersSchema;
