var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var CustomerSchema = new Schema({

    customer_id: {
        type: String
    },
    customer_name: {
        type: String,
        'default': ''
    },
      customer_person: {
        type: String,
        'default': ''
    },
      customer_phone: {
        type: String,
        'default': ''
    },
      customer_address: {
        type: String,
        'default': ''
    },
         customer_desc: {
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

module.exports = CustomerSchema;
