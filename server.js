/* eslint-disable */
const express = require('express');
var request = require('request');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const serveStatic = require('serve-static')
const path = require('path')
var config;
if (process.env.NODE_ENV !== 'production') {
	config = require('./config/settings');
}
const my_client_id = process.env.spotifyClientId || config.spotifyClientId;
const my_client_secret = process.env.spotifyClientSecret || config.spotifyClientSecret;
//var history = require('connect-history-api-fallback');

// Set up the app
const app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
app.use(morgan('combined'));
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({
	parameterLimit: 100000,
	limit: '100mb',
	extended: true,
}));
app.use(cors());

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
					refreshPrimaryToken(token);
				}
			});
		} else if (count > 1) {
			console.log('Uh oh, more than 1 token');
		} else {
			console.log('No token');
		}
	});

	// Set up the API routes
	const spotifyRoutes = require('./expressRoutes/spotifyRoutes.js')(app, io);
	app.use('/spotify', spotifyRoutes);

	const userRoutes = require('./expressRoutes/userRoutes.js');
	app.use('/users', userRoutes);

	const pythonRoutes = require('./expressRoutes/pythonRoutes.js');
	app.use('/python', pythonRoutes);

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

function refreshPrimaryToken(token) {

	var authOptions = {
		url: 'https://accounts.spotify.com/api/token',
		form: {
			grant_type: 'refresh_token',
			refresh_token: token.refresh_token
		},
		headers: {
			'Authorization': 'Basic ' + (new Buffer(my_client_id + ':' + my_client_secret).toString('base64'))
		},
		json: true
	};
	request.post(authOptions, function (error, response, body) {
		if (!error && response.statusCode === 200) {

			var primary_access_token = body.access_token;
			console.log('Primary Access token refreshed');
			token.access_token = primary_access_token;
			token.save((err) => {
				if (err) console.log(err);
				else {
					console.log('primary refresh successful');
				}
			});
		} else {
			console.log(body);
			console.log('primary refresh unsuccessful');
		}
	});
}