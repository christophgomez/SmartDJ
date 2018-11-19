var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var tokenSchema = new Schema({
	_id: Number,
	access_token: String,
	refresh_token: String
});

var Token = mongoose.model("Token", tokenSchema, "token");
module.exports = Token;