var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var PurchaseSchema = new Schema({

    purchase_id: {
        type: String
    },
    purchase_name: {
        type: String,
        'default': ''
    },
      purchase_person: {
        type: String,
        'default': ''
    },
      purchase_address: {
        type: String,
        'default': ''
    },
         purchase_desc: {
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

module.exports = PurchaseSchema;
