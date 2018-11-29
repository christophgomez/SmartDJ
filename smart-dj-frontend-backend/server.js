/* eslint-disable */
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');
var request = require('request');
var config = require('./config/settings');
const my_client_id = config.spotifyClientId;
const my_client_secret = config.spotifyClientSecret;

// Set up the app
const app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

// Set up MongoDB
const mongoose = require('mongoose');
const Token = require('./models/token');
const User = require('./models/user');
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
	db.collection('users').countDocuments((err, count) => {
		if (err) {
			console.log(err);
		} else if(count >= 1) {
			refreshAllUserTokens();
		} else {
			console.log('no users');
		}
	})
	const spotifyRoutes = require('./expressRoutes/spotifyRoutes.js')(app, io);
	app.use('/spotify', spotifyRoutes);
	const userRoutes = require('./expressRoutes/userRoutes.js');
	app.use('/users', userRoutes);
	const analyticRoutes = require('./expressRoutes/analyticRoutes.js');
	app.use('/analytics', analyticRoutes);

	var port = config.serverPort;

	// Listen for connections to the port
	server.listen(port, () => console.log('Server listening on port ' + port));
});

function refreshAllUserTokens() {
	User.find({}, (err, users) => {
		if (err) console.log(err);
		if (!users) console.log('No users to refresh tokens');
		else {
			for (var i = 0; i < users.length; ++i) {
				(function (i) {
					var authOptions = {
						url: 'https://accounts.spotify.com/api/token',
						form: {
							grant_type: 'refresh_token',
							refresh_token: users[i].refresh_token
						},
						headers: {
							'Authorization': 'Basic ' + (new Buffer(my_client_id + ':' + my_client_secret).toString('base64'))
						},
						json: true
					};
					request.post(authOptions, function (error, response, body) {
						if (!error && response.statusCode === 200) {
							console.log('User access token refreshed');
							users[i].access_token = body.access_token;
							users[i].save((err) => {
								if (err) console.log(err);
							});
						} else {
							console.log(body);
							console.log('refresh unsuccessful');
						}
					});
				})(i);
			}
		}
	});
}

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