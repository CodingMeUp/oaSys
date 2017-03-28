var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var UserRoleSchema = new Schema({

    user_id: {
        type: String
    },
    role_id: {
        type: String
    }
});

module.exports = UserRoleSchema;