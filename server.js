/* eslint-disable */
const TokenFunctions = require('./expressRoutes/TokenFunctions');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const serveStatic = require('serve-static')
const path = require('path')
var config;
if (process.env.NODE_ENV !== 'production') {
	config = require('./config/settings');
}
const Python = require("./expressRoutes/PythonFunctions").Python;
const SpotifyFunctions = require('./expressRoutes/SpotifyFunctions');
var detection = null;
var voice = null;

//var history = require('connect-history-api-fallback');

// Set up the app
const app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
app.use(morgan('combined'));
app.use(bodyParser.json({
	limit: '100mb'
}));
app.use(bodyParser.urlencoded({
	parameterLimit: 100000,
	limit: '100mb',
	extended: true,
}));
app.use(cors());

var run = false;

// Set up MongoDB
const mongoose = require('mongoose');
const Token = require('./models/token');
mongoose.connect('mongodb://localhost:27017/smartdj');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'mongoose connection error'));
db.once('open', function (callback) {
	console.log('mongoose connection succeeded');
	db.collection('token').countDocuments((err, count) => {
		if (err) {
			console.log(err);
		} else if (count === 1) {
			Token.findById(1, (err, token) => {
				if (err) console.log(err);
				if (!token) console.log('token null');
				else {
					app.set('primary_access_token', token.access_token);
					app.set('primary_refresh_token', token.refresh_token);
					console.log('Primary Token Configured');
					TokenFunctions.refreshPrimaryToken(token);
					TokenFunctions.setPrimaryToken(token);
					run = true;
					var detectionConstructor = {
						scriptPath: 'computer-vision/detection.py',
						args: ['computer-vision/proto.prototxt.txt', 'computer-vision/cafe.caffemodel']
					};
					var voiceConstructor = {
						scriptPath: 'computer-vision/voice.py',
						args: []
					}
					var detection;
					var voice;
					if (run === true) {
						console.log("starting video detection script");
						const pythonRoutes = require('./expressRoutes/pythonRoutes.js')(app, detection, voice, voiceConstructor, detectionConstructor, io);
						app.use('/python', pythonRoutes);
						console.log("set up python routes")
					}
				}
			});
		} else if (count > 1) {
			console.log('Uh oh, more than 1 token');
		} else {
			console.log('No token');
		}
	});

	// app.set('scriptRef', detection);

	console.log("Setting up routes")
	// Set up the API routes
	const spotifyRoutes = require('./expressRoutes/spotifyRoutes.js')(app, io);
	app.use('/spotify', spotifyRoutes);
	console.log("set up spotify routes")

	const userRoutes = require('./expressRoutes/userRoutes.js');
	app.use('/users', userRoutes);
	console.log("set up user routes")

	// Set up the server to serve the built frontend
	app.use("/", serveStatic(path.join(__dirname, '/dist')));
	// Catch all routes and redirect to the index file
	app.get('*', function (req, res) {
		res.sendFile(__dirname + '/dist/index.html')
	})


	// Listen for connections to the port
	const port = process.env.PORT || config.serverPort;
	var baseURL = process.env.baseURL || config.baseURL;

	// Use child process to run python - computer vsion
	server.listen(port, () => {
		console.log('Server listening on port ' + baseURL + port);
	});

});