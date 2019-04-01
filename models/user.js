var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
	access_token: String,
	refresh_token: String,
	email: String,
	name: String,
	images: [],
});

var User = mongoose.model("User", UserSchema, 'users');
module.exports = User;