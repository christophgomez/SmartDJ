var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
	username: {
		type: String,
		required: true,
	},
	password: {
		type: String,
		required: true
	},
	access_token: String,
	refresh_token: String,
	email: String,
	spotify_type: String
});

var User = mongoose.model("User", UserSchema);
module.exports = User;