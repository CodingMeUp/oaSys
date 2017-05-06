var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ApplySchema = new Schema({

    apply_id: {
        type: String
    },
    apply_name: {
        type: String,
        'default': ''
    },
      apply_person: {
        type: String,
        'default': ''
    },
      apply_phone: {
        type: String,
        'default': ''
    },
      apply_address: {
        type: String,
        'default': ''
    },
         apply_desc: {
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

module.exports = ApplySchema;
