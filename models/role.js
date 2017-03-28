var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var RoleSchema = new Schema({

    role_id: {
        type: String,
        'default': ''
    },
    role_name: {
        type: String,
        'default': ''
    },
      role_name_full: {
        type: String,
        'default': ''
    },
    role_remark: {
        type: String,
        'default': ''
    }
});

module.exports = RoleSchema;