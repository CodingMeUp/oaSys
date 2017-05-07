var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var HouseSchema = new Schema({

    house_id: {
        type: String
    },
    house_name: {
        type: String,
        'default': ''
    },
      house_person: {
        type: String,
        'default': ''
    },
      house_phone: {
        type: String,
        'default': ''
    },
      house_address: {
        type: String,
        'default': ''
    },
         house_desc: {
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

module.exports = HouseSchema;
