const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var RequestSchema = new Schema({
	from: String,
	endpoint: String,
	time: {
		created: Number,
		received: Number,
		executed: Number,
		totalTime: Number
	}
});

var Request = mongoose.model("Request", RequestSchema, "requests");

module.exports = Request;