const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    createdEvents : [
        {
            type: Schema.Types.ObjectId,
            ref: 'Event' //let mongoose know that two objects are related
        }
    ] //list of event Ids that were created by a user
});

module.exports = mongoose.model('User', userSchema);