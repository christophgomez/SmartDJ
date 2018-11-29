const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var SessionSchema = new Schema({
	createdAt: Number,
	endedAt: Number,
});

var Session = mongoose.model("ListeningSession", SessionSchema, "sessions");

module.exports = Session;