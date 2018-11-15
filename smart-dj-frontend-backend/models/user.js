var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
	username: String,
	password: String,
	access_token: String,
	refresh_token: String,
});

var User = mongoose.model("User", UserSchema);
module.exports = User;